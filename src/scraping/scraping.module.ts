import { Module } from '@nestjs/common';
import { ScrapingService } from './scraping.service';
import { ScrapingController } from './scraping.controller';

@Module({
  controllers: [ScrapingController],
  providers: [ScrapingService],
})
export class ScrapingModule {}
