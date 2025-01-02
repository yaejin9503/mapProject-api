import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ScrapingModule } from './scraping/scraping.module';
import { ImageProcessingModule } from './image-processing/image-processing.module';

@Module({
  imports: [ScrapingModule, ImageProcessingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
