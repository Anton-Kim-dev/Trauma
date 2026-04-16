export {};

import { UserInfo } from "@custom_types/userinfo";

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            NODE_ENV: 'development' | 'production'; 
            JWT_VER: `${number}`;
            JWT_EXP: `${number}`;
            JWT_REFRESH_EXP: `${number}`;
            JWT_SECRET: string;
            JWT_REFRESH_SALT: string;
            DB_USER: string;
            DB_PASS: string;
            DB_HOST: string;
            DB_PORT: string;
            AUTH_SERVICE_URL: string;
            AUTH_SERVICE_DB: string;
            USERS_SERVICE_URL: string;
            USERS_SERVICE_DB: string;
            APPOINTMENTS_SERVICE_URL: string;
            APPOINTMENTS_SERVICE_DB: string;
        }
    }

    namespace Express {
        interface Request {
            user?: UserInfo;
            parsedQuery?: Record<string, string>;
        }
    }
}