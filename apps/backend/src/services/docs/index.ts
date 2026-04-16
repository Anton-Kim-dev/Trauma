import "dotenv/config";
import express from "express";
import swaggerUi from "swagger-ui-express";

const app = express();
const proxyUrl = process.env?.PROXY_URL ?? "http://localhost";

app.use("/docs", swaggerUi.serve, swaggerUi.setup({}, {
    explorer: true,
    swaggerOptions: {
        urls: [
            { url: `${proxyUrl}/swagger/auth`, name: "Auth" },
            { url: `${proxyUrl}/swagger/users`, name: "Users" },
            { url: `${proxyUrl}/swagger/appointments`, name: "Appointments" },
        ]
    }
}));

const port = process.env.DOCS_SERVICE_PORT ?? process.env.PORT ?? 3000;
app.listen(port, () => console.log(`Docs running on port ${port}`));