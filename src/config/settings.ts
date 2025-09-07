import { config } from 'dotenv';
import { join } from 'path';
import { object, string, number, InferType } from 'yup';
import { transformEnvVars } from './env-var-transformer';

config({ path: join(process.cwd(), '.env') });

const schema = object().shape({
  NODE_ENV: string().oneOf(['development', 'production', 'test']).required(),
  LOG_LEVEL: string().oneOf(['debug', 'info', 'error', 'warn']).required(),
  PORT: number().required().default(3000),
  HOST: string().required().default('localhost'),
  DATABASE_URL: string().required(),
  JWT_SECRET: string().required(),
  BCRYPT_SALT_ROUNDS: string().required().default('12'),
  auth0: object().shape({
    domain: string().required(),
    clientId: string().required(),
    clientSecret: string().required(),
    callbackUrl: string().required(),
  }),
  smtp: object().shape({
    host: string().required().default('smtp.example.com'),
    port: number().required().default(2525),
    user: string().required(),
    pass: string().required(),
  }),
  rate_limit: object().shape({
    limit: number().required().default(100),
    ttl: number().required().default(60),
  }),
});

export type Settings = InferType<typeof schema>;
// First transform env vars like auth0__domain into nested objects
const transformedEnv = transformEnvVars(process.env);

// Then validate against the schema
const settings: Settings = schema.validateSync(transformedEnv, {
  stripUnknown: true,
});

export default settings;
