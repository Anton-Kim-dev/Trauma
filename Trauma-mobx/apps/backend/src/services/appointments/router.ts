import { Router } from "express";
import { HTTPClient } from "@modules/client";
import { validateBody, validateAuth, validateUserRole } from "@modules/validate";
import AppointmentsDatabase from "./database.js";
import AppointmentsRepository from "./repository.js";
import AppointmentsService from "./service.js";
import AppointmentsController from "./controller.js";

import { AppointmentsCreateRequestSchema } from "@contracts/appointments/create.js";
import { AppointmentsCompleteRequestSchema } from "@contracts/appointments/complete.js";

const usersClient = new HTTPClient(process.env.USERS_SERVICE_URL!);

const router = Router();
const repo = new AppointmentsRepository(AppointmentsDatabase);
const service = new AppointmentsService(repo, usersClient);
const controller = new AppointmentsController(service);

router.get("/get", validateAuth(), validateUserRole("P", "D", "A"), controller.get.bind(controller));
router.post("/create", validateAuth(), validateUserRole("P"), validateBody(AppointmentsCreateRequestSchema), controller.create.bind(controller));
router.post("/cancel", validateAuth(), validateUserRole("P", "D", "A"), controller.cancel.bind(controller));
router.post("/complete", validateAuth(), validateUserRole("D"), validateBody(AppointmentsCompleteRequestSchema), controller.complete.bind(controller));

export default router;