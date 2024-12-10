// src/scraping/scraping.service.ts
import { Injectable } from '@nestjs/common';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import { scrapingConfigs } from './configs';

@Injectable()
export class ScrapingService {
  private async setupDriver(): Promise<WebDriver> {
    const options = new chrome.Options();
    options.addArguments('--headless', '--disable-gpu', '--no-sandbox');
    return await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  }

  private async scrapeSite(
    configKey: keyof typeof scrapingConfigs,
  ): Promise<any> {
    const config = scrapingConfigs[configKey];
    const driver = await this.setupDriver();
    try {
      await driver.get(config.url);

      if (config.radioSelector) {
        const radioButton = await driver.findElement(
          By.css(config.radioSelector),
        );
        await radioButton.click();
      }

      if (config.buttonSelector) {
        const searchButton = await driver.findElement(
          By.css(config.buttonSelector),
        );
        await searchButton.click();
      }

      await driver.wait(
        until.elementLocated(By.css(config.waitSelector)),
        5000,
      );

      const resultElements = await driver.findElements(
        By.css(config.resultSelector),
      );
      const results: string[][] = [];

      for (const element of resultElements) {
        const text = await element.getText();
        results.push(text.split('\n'));
      }

      return config.parseData(results);
    } finally {
      await driver.quit();
    }
  }

  async fetchSite(key: keyof typeof scrapingConfigs): Promise<any> {
    return this.scrapeSite(key);
  }

  async fetchAllSites(): Promise<Record<string, any>> {
    const results: Record<string, any> = {};

    for (const key of Object.keys(scrapingConfigs) as Array<
      keyof typeof scrapingConfigs
    >) {
      try {
        results[key] = await this.scrapeSite(key);
      } catch (error) {
        console.error(
          `Error fetching ${scrapingConfigs[key].name} notices:`,
          error,
        );
        results[key] = { error: 'Failed to fetch data' };
      }
    }

    return results;
  }
}
