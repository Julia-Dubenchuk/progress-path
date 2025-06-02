import { config } from 'dotenv';
import { join } from 'path';
import { object, string, number, InferType } from 'yup';
import { transformEnvVars } from './env-var-transformer';

config({ path: join(process.cwd(), '.env') });

const schema = object().shape({
  NODE_ENV: string().oneOf(['development', 'production', 'test']).required(),
  PORT: number().required().default(3000),
  HOST: string().required().default('localhost'),
  DATABASE_URL: string().required(),
  JWT_SECRET: string().required(),
  auth0: object().shape({
    domain: string().required(),
    clientId: string().required(),
    clientSecret: string().required(),
    callbackUrl: string().required(),
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
