import { Injectable } from '@nestjs/common';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { scrapingConfigs, ScrapingConfig } from './configs';
import { retry } from './utils/retry';
import { logger } from './utils/logger';

@Injectable()
export class ScrapingService {
  private async setupDriver(): Promise<WebDriver> {
    const options = new chrome.Options();
    options.addArguments('--headless', '--disable-gpu', '--no-sandbox');
    return new Builder().forBrowser('chrome').setChromeOptions(options).build();
  }

  private async scrapeSite(
    config: ScrapingConfig,
  ): Promise<Record<string, any>> {
    return retry(
      async () => {
        const driver = await this.setupDriver();
        try {
          // 페이지 열기
          await driver.get(config.url);

          // 라디오 버튼 클릭 (선택 사항)
          if (config.radioSelector) {
            const radioButton = await driver.findElement(
              By.css(config.radioSelector),
            );
            await radioButton.click();
          }

          // 버튼 클릭 (선택 사항)
          if (config.buttonSelector) {
            const button = await driver.findElement(
              By.css(config.buttonSelector),
            );
            await button.click();
          }

          // 결과 대기
          await driver.wait(
            until.elementLocated(By.css(config.waitSelector)),
            5000,
          );

          // 데이터 수집
          const elements = await driver.findElements(
            By.css(config.resultSelector),
          );
          const results: string[][] = [];
          for (const element of elements) {
            const text = await element.getText();
            results.push(text.split('\n'));
          }

          return config.parseData(results);
        } finally {
          await driver.quit();
        }
      },
      3,
      2000,
      (error, attempt) => {
        logger.error(`[${config.name}] Attempt ${attempt} failed`, {
          message: error.message,
        });
      },
    );
  }

  async fetchSite(
    key: keyof typeof scrapingConfigs,
  ): Promise<Record<string, any>> {
    const config = scrapingConfigs[key];
    return this.scrapeSite(config);
  }

  async fetchAllSites(): Promise<Record<string, Record<string, any>>> {
    const results: Record<string, Record<string, any>> = {};
    for (const key of Object.keys(scrapingConfigs) as Array<
      keyof typeof scrapingConfigs
    >) {
      try {
        results[key] = await this.fetchSite(key);
      } catch (error) {
        console.error(
          `Failed to fetch ${scrapingConfigs[key].name} data:`,
          error.message,
        );
        results[key] = { error: 'Failed to fetch data' };
      }
    }
    return results;
  }
}
