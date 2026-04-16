import { BaseError } from "./base.js";

export class CancelAppointmentError extends BaseError {
    constructor() {
        super("Failed to cancel appointment", 500);
    }
}