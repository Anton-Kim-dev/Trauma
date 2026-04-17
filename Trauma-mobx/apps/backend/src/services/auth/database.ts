import { env } from "@config/env";
import { Database } from "@modules/database";

const AuthDatabase = new Database(
    `postgresql://${env.DB_USER}:${env.DB_PASS}@${env.DB_HOST}:${env.DB_PORT}/${env.AUTH_SERVICE_DB}`
);

export default AuthDatabase;