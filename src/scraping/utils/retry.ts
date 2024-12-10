export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3, // 최대 재시도 횟수
  delay = 1000, // 재시도 간 지연 시간 (밀리초)
  logError: (error: any, attempt: number) => void = (error, attempt) => {
    console.error(`Attempt ${attempt} failed:`, error.message);
  },
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn(); // 성공 시 결과 반환
    } catch (error) {
      attempt++;
      logError(error, attempt);
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, delay)); // 지연 후 재시도
      } else {
        throw error; // 재시도 횟수를 초과하면 에러를 다시 던짐
      }
    }
  }
  throw new Error('Unexpected error in retry logic');
}
