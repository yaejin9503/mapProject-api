import sys
import cv2
import numpy as np
import pytesseract
from PIL import Image

def extract_text_from_image(image_path):
    try:
        # 이미지 읽기
        image = cv2.imread(image_path)
        
        # 그레이스케일 변환
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # 노이즈 제거
        denoised = cv2.fastNlMeansDenoising(gray)
        
        # 이진화
        _, binary = cv2.threshold(denoised, 128, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # 표 영역 강화
        kernel = np.ones((2,2), np.uint8)
        dilated = cv2.dilate(binary, kernel, iterations=1)
        
        # PIL Image로 변환
        pil_image = Image.fromarray(dilated)
        
        # OCR 수행 (한글 + 영어)
        text = pytesseract.image_to_string(pil_image, lang='kor+eng', config='--psm 6')
        
        print(text.strip())
        
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python extract_text.py <image_path>", file=sys.stderr)
        sys.exit(1)
        
    image_path = sys.argv[1]
    extract_text_from_image(image_path) 