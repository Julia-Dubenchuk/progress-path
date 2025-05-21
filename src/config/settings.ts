import { config } from 'dotenv';
import { join } from 'path';
import * as yup from 'yup';
import { transformEnvVars } from './env-var-transformer';

config({ path: join(process.cwd(), '.env') });


const schema = yup.object().shape({
  NODE_ENV: yup.string().oneOf(['dev', 'production']).required(),
  PORT: yup.number().required().default(3000),
  DATABASE_URL: yup.string().required(),
  JWT_SECRET: yup.string().required(),
  auth0: yup.object().shape({
    domain: yup.string().required(),
    clientId: yup.string().required(),
    clientSecret: yup.string().required(),
  }),
});
export type Settings = yup.InferType<typeof schema>;
// First transform env vars like auth0__domain into nested objects
const transformedEnv = transformEnvVars(process.env);

// Then validate against the schema
const settings: Settings = schema.validateSync(transformedEnv, {
  stripUnknown: true,
});

export default settings;
