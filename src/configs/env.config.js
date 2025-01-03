import { configDotenv } from "dotenv";
import { cleanEnv, str, num } from "envalid";
configDotenv();

const env = cleanEnv(process.env, {
  PORT: num({ default: 8000 }),
  DB_URI: str(),
  JWT_SECRET: str(),
  JWT_TOKEN_AGE: str({ default: "30d" }),
  /*---------------------------------aws credentials----------------------------*/
  AWS_REGION: str(),
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_BUCKET_NAME: str(),
  
});
export default env;
