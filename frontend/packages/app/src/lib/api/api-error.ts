export class ApiError extends Error {
  status: number;

  constructor(status: number) {
    super(`API error: ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}
