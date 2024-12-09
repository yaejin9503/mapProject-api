import { Injectable } from '@nestjs/common';
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';

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
    url: string,
    waitSelector: string,
    resultSelector: string,
    parseData: (results: string[][]) => Record<string, any>,
    radioSelector?: string,
    buttonSelector?: string,
  ): Promise<any[]> {
    const driver = await this.setupDriver();
    try {
      // 페이지 열기
      await driver.get(url);

      // 라디오 버튼 클릭 (필요할 경우)
      if (radioSelector) {
        const radioButton = await driver.findElement(By.css(radioSelector));
        await radioButton.click();
      }

      // 검색 버튼 클릭 (필요할 경우)
      if (buttonSelector) {
        const searchButton = await driver.findElement(By.css(buttonSelector));
        await searchButton.click();
      }

      // 결과 대기
      await driver.wait(until.elementLocated(By.css(waitSelector)), 5000);

      // 결과 데이터 수집
      const resultElements = await driver.findElements(By.css(resultSelector));
      const results: string[][] = [];

      for (const element of resultElements) {
        const text = await element.getText();
        results.push(text.split('\n'));
      }

      // 데이터 파싱
      const parsedData = parseData(results);

      return [parsedData];
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      await driver.quit();
    }
  }

  async fetchLHNotices(): Promise<any[]> {
    return this.scrapeSite(
      'https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancList.do?mi=1026',
      'div.bbs_ListA',
      'div.bbs_ListA',
      (results) => {
        const resultobj: Record<string, any> = {};
        for (let i = 2; i < results[0].length; i += 4) {
          const key = results[0][i].split(' ')[0];
          const value = [
            results[0][i + 1],
            `${results[0][i + 2]} ${results[0][i + 3]}`,
          ];
          resultobj[key] = value;
        }
        return resultobj;
      },
    );
  }

  async fetchGHNotices(): Promise<any[]> {
    return this.scrapeSite(
      'https://www.gh.or.kr/gh/announcement-of-salerental001.do?srCategoryId=12',
      'div.board-list-table-wrap',
      'div.board-list-table-wrap',
      (results) => {
        const resultobj: Record<string, any> = {};
        for (let i = 1; i < results[0].length; i += 3) {
          const key = results[0][i].split(' ')[0];
          const value = [results[0][i + 1], results[0][i + 2]];
          resultobj[key] = value;
        }
        return resultobj;
      },
    );
  }

  async fetchSHNotices(): Promise<any[]> {
    return this.scrapeSite(
      'https://www.i-sh.co.kr/main/lay2/program/S1T294C295/www/brd/m_241/list.do',
      'div.listTable',
      'div.listTable',
      (results) => {
        const resultobj: Record<string, any> = {};
        for (let i = 2; i < results[0].length; i += 3) {
          const key = results[0][i];
          const value = [results[0][i + 1], results[0][i + 2]];
          resultobj[key] = value;
        }
        return resultobj;
      },
      '#annType1Now', // 라디오 버튼 선택자
      'a.btn.btnGreen', // 검색 버튼 선택자
    );
  }

  async fetchAllNotices(): Promise<Record<string, any>> {
    const configs = [
      {
        name: 'LH',
        url: 'https://apply.lh.or.kr/lhapply/apply/wt/wrtanc/selectWrtancList.do?mi=1026',
        waitSelector: 'div.bbs_ListA',
        resultSelector: 'div.bbs_ListA',
        parseData: (results: string[][]) => {
          const resultobj: Record<string, any> = {};
          for (let i = 2; i < results[0].length; i += 4) {
            const key = results[0][i].split(' ')[0];
            const value = [
              results[0][i + 1],
              `${results[0][i + 2]} ${results[0][i + 3]}`,
            ];
            resultobj[key] = value;
          }
          return resultobj;
        },
      },
      {
        name: 'GH',
        url: 'https://www.gh.or.kr/gh/announcement-of-salerental001.do?srCategoryId=12',
        waitSelector: 'div.board-list-table-wrap',
        resultSelector: 'div.board-list-table-wrap',
        parseData: (results: string[][]) => {
          const resultobj: Record<string, any> = {};
          for (let i = 1; i < results[0].length; i += 3) {
            const key = results[0][i].split(' ')[0];
            const value = [results[0][i + 1], results[0][i + 2]];
            resultobj[key] = value;
          }
          return resultobj;
        },
      },
      {
        name: 'SH',
        url: 'https://www.i-sh.co.kr/main/lay2/program/S1T294C295/www/brd/m_241/list.do',
        waitSelector: 'div.listTable',
        resultSelector: 'div.listTable',
        parseData: (results: string[][]) => {
          const resultobj: Record<string, any> = {};
          for (let i = 2; i < results[0].length; i += 3) {
            const key = results[0][i];
            const value = [results[0][i + 1], results[0][i + 2]];
            resultobj[key] = value;
          }
          return resultobj;
        },
        radioSelector: '#annType1Now',
        buttonSelector: 'a.btn.btnGreen',
      },
    ];

    const results: Record<string, any> = {};

    for (const config of configs) {
      results[config.name] = await this.scrapeSite(
        config.url,
        config.waitSelector,
        config.resultSelector,
        config.parseData,
        config.radioSelector,
        config.buttonSelector,
      );
    }

    return results;
  }
}
