import { Controller, Get } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get('sh-notices')
  async getRecruitmentNoticesSH() {
    const data = await this.scrapingService.fetchSHNotices();
    return { success: true, data };
  }

  @Get('gh-notices')
  async getRecruitmentNoticesGH() {
    const data = await this.scrapingService.fetchGHNotices();
    return { success: true, data };
  }

  @Get('lh-notices')
  async getRecruitmentNoticesLH() {
    const data = await this.scrapingService.fetchLHNotices();
    return { success: true, data };
  }

  @Get('all-notices')
  async fetchAllNotices() {
    const data = await this.scrapingService.fetchAllNotices();
    return { success: true, data };
  }
}
