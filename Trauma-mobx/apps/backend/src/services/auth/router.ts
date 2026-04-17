import { Router } from "express";
import { validateBody, validateAuth, validateUserRole } from "@modules/validate";
import { HTTPClient } from "@modules/client/index.js";
import AuthDatabase from "./database.js";
import AuthRepository from "./repository.js";
import AuthService from "./service.js";
import AuthController from "./controller.js";

import { RegisterRequestSchema } from "@contracts/auth/register.js";
import { LoginRequestSchema } from "@contracts/auth/login.js";
import { LogoutRequestSchema } from "@contracts/auth/logout.js";
import { RefreshRequestSchema } from "@contracts/auth/refresh.js";

const usersClient = new HTTPClient(process.env.USERS_SERVICE_URL!);
const router = Router();
const repo = new AuthRepository(AuthDatabase);
const service = new AuthService(repo, usersClient);
const controller = new AuthController(service);

router.post("/admin/add_user", validateAuth(), validateUserRole("A"), validateBody(RegisterRequestSchema), controller.addUser.bind(controller));
router.post("/register", validateBody(RegisterRequestSchema), controller.register.bind(controller));
router.post("/login", validateBody(LoginRequestSchema), controller.login.bind(controller));
router.post("/logout", validateBody(LogoutRequestSchema), controller.logout.bind(controller));
router.post("/refresh", validateBody(RefreshRequestSchema), controller.refresh.bind(controller));

export default router;