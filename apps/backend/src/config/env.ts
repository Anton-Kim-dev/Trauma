import dotenv from "dotenv";
dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

const toInt = (key: string, val: string) => {
    const n = parseInt(val, 10);
    if (isNaN(n)) throw new Error(`Env variable ${key} must be of type 'number', got: '${val}'`);
    return n;
};

export const env = {
    NODE_ENV:                   process.env.NODE_ENV,
    JWT_VER:                    toInt('JWT_VER', process.env.JWT_VER),
    JWT_EXP:                    toInt('JWT_EXP', process.env.JWT_EXP),
    JWT_REFRESH_EXP:            toInt('JWT_REFRESH_EXP', process.env.JWT_REFRESH_EXP),
    JWT_SECRET:                 process.env.JWT_SECRET,
    JWT_REFRESH_SALT:           process.env.JWT_REFRESH_SALT,
    DB_USER:                    process.env.DB_USER,
    DB_PASS:                    process.env.DB_PASS,
    DB_HOST:                    process.env.DB_HOST,
    DB_PORT:                    process.env.DB_PORT,
    AUTH_SERVICE_URL:           process.env.AUTH_SERVICE_URL,
    AUTH_SERVICE_DB:            process.env.AUTH_SERVICE_DB,
    USERS_SERVICE_URL:          process.env.USERS_SERVICE_URL,
    USERS_SERVICE_DB:           process.env.USERS_SERVICE_DB,
    APPOINTMENTS_SERVICE_URL:   process.env.APPOINTMENTS_SERVICE_URL,
    APPOINTMENTS_SERVICE_DB:    process.env.APPOINTMENTS_SERVICE_DB,
} as const;