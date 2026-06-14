import { ApiError } from './api-error';

export async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
  });

  if (!response.ok) {
    throw new ApiError(response.status);
  }

  return response.json();
}
