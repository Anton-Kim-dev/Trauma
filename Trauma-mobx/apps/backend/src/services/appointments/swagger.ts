import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Appointments API",
        version: "1.0.0",
    },
    host: "http://localhost/api/appointments",
    securityDefinitions: {
        bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
        }
    },
};

const outputFile = "./swagger-output.json";
const routes = ["./src/services/appointments/router.ts"];

swaggerAutogen()(outputFile, routes, doc);