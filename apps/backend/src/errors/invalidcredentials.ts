import { BaseError } from "./base.js";

export class InvalidCredentialsError extends BaseError {
    constructor() {
        super("Неверный логин или пароль", 401);
    }
}
