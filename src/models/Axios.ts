import { AxiosError as Err, isAxiosError } from 'axios';

export type AxiosError = Err<{ ErrorDescription: string; ErrorCode: number }>;

export const isApiError = (e: unknown): e is AxiosError =>
  isAxiosError(e) && (e as AxiosError).response?.data?.ErrorDescription !== undefined;
