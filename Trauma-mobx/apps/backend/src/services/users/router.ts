import { Router } from "express";
import UsersDatabase from "./database.js";
import UsersRepository from "./repository.js";
import UsersService from "./service.js";
import UsersController from "./controller.js";

import { validateAuth, validateUserRole, validateBody, validateQuery } from "@modules/validate";
import { UsersPatientsInfoRequestSchema } from "@shared/types/contracts/users/patients/info.js";
import { UsersDoctorsInfoRequestSchema } from "@shared/types/contracts/users/doctors/info.js";
import { UsersPatientsUpdateRequestSchema } from "@contracts/users/patients/update.js";

const router = Router();
const repo = new UsersRepository(UsersDatabase);
const service = new UsersService(repo);
const controller = new UsersController(service);

router.get("/patients/get", validateAuth(), validateUserRole("D", "A"), controller.patientsGet.bind(controller));
router.get("/doctors/get", validateAuth(), validateUserRole("P", "A"), controller.doctorsGet.bind(controller));
router.get("/patients/info", validateAuth(), validateUserRole("P", "A"), validateQuery(UsersPatientsInfoRequestSchema), controller.patientsInfo.bind(controller));
router.get("/doctors/info", validateAuth(), validateUserRole("D", "A"), validateQuery(UsersDoctorsInfoRequestSchema), controller.doctorsInfo.bind(controller));
router.post("/patients/update", validateAuth(), validateUserRole("P"), validateBody(UsersPatientsUpdateRequestSchema), controller.patientsUpdate.bind(controller));

export default router;