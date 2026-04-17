import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Users API",
        version: "1.0.0",
    },
    host: "http://localhost/api/users",
    securityDefinitions: {
        bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
        }
    },
};

const outputFile = "./swagger-output.json";
const routes = ["./src/services/users/router.ts"];

swaggerAutogen()(outputFile, routes, doc);