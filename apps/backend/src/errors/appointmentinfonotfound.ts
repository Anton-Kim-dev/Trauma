import { BaseError } from "./base.js";

export class AppointmentInfoNotFoundError extends BaseError {
    constructor() {
        super("Failed to retrieve requested appointment data", 404);
    }
}