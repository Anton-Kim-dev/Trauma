import { BaseError } from "./base.js";

export class SchemaMismatchError extends BaseError {
    constructor() {
        super("Invalid data format", 400);
    }
}