import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class ImageProcessingService {
  async extractTextFromImage(imagePath: string): Promise<{ text: string }> {
    try {
      const result = await this.runPythonScript(imagePath);
      return { text: result };
    } catch (error) {
      throw new Error(`이미지 처리 중 오류 발생: ${error.message}`);
    }
  }

  private runPythonScript(imagePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        'scripts/extract_text.py',
        imagePath,
      ]);

      let outputData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python 스크립트 오류: ${errorData}`));
        } else {
          resolve(outputData.trim());
        }
      });
    });
  }
}
