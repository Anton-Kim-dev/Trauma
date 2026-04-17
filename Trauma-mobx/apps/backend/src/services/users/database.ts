import { env } from "@config/env";
import { Database } from "@modules/database";

const UsersDatabase = new Database(
    `postgresql://${env.DB_USER}:${env.DB_PASS}@${env.DB_HOST}:${env.DB_PORT}/${env.USERS_SERVICE_DB}`
);

export default UsersDatabase;