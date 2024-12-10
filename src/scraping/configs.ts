export type ScrapingConfig = {
  name: string;
  url: string;
  waitSelector: string;
  resultSelector: string;
  parseData: (results: string[][]) => Record<string, any>;
  radioSelector?: string;
  buttonSelector?: string;
};

export const scrapingConfigs: Record<string, ScrapingConfig> = {
  lh: {
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
  gh: {
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
  sh: {
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
};
