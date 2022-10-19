import { AxiosError as Err } from 'axios';

export type AxiosError = Err<{ ErrorDescription: string; ErrorCode: number }>;
