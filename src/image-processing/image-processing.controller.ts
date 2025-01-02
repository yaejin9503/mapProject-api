import { Controller, Post, Body } from '@nestjs/common';
import { ImageProcessingService } from './image-processing.service';

@Controller('image-processing')
export class ImageProcessingController {
  constructor(
    private readonly imageProcessingService: ImageProcessingService,
  ) {}

  @Post('extract-text')
  async extractText(@Body() body: { imagePath: string }) {
    return await this.imageProcessingService.extractTextFromImage(
      body.imagePath,
    );
  }
}
