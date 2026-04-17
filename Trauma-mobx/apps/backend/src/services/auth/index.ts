import express from "express";
import serviceRouter from "./router.js";
import swaggerOutput from './swagger-output.json' assert { type: 'json' };

const app = express();
app.use(express.json());
app.use("/auth", serviceRouter);
app.get("/swagger.json", (req, res) => res.json(swaggerOutput));

const PORT = process.env.AUTH_SERVICE_PORT ?? process.env.PORT ?? 3000;
app.listen(PORT, () => console.log(`Auth service running on port ${PORT}`));