import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Auth API",
        version: "1.0.0",
    },
    host: "http://localhost/api/auth",
    securityDefinitions: {
        bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
        }
    },
};

const outputFile = "./swagger-output.json";
const routes = ["./src/services/auth/router.ts"];

swaggerAutogen()(outputFile, routes, doc);