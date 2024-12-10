import { Controller, Get, Query } from '@nestjs/common';
import { ScrapingService } from './scraping.service';

@Controller('scraping')
export class ScrapingController {
  constructor(private readonly scrapingService: ScrapingService) {}

  @Get('notices')
  async getRecruitmentNotices(@Query('site') site: string) {
    const data = await this.scrapingService.fetchSite(site);
    return { success: true, data };
  }

  @Get('all-notices')
  async fetchAllNotices() {
    const data = await this.scrapingService.fetchAllSites();
    return { success: true, data };
  }
}
