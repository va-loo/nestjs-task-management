import { object, string, number } from '@hapi/joi';

export const configValidationSchema = object({
  STAGE: string().required(),
  DB_HOST: string().required(),
  DB_PORT: number().default(5432).required(),
  DB_USERNAME: string().required(),
  DB_PASSWORD: string().required(),
  DB_DATABASE: string().required(),
  JWT_SECRET: string().required(),
});
