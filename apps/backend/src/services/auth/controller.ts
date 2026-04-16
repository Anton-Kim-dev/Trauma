import type { Request, Response, NextFunction } from "express";
import AuthService from "./service.js";
import { InvalidCredentialsError } from "@errors/invalidcredentials";
import { InvalidTokenError } from "@errors/invalidtoken";

import type { RegisterRequestDto } from "@contracts/auth/register.js";
import type { LoginRequestDto } from "@contracts/auth/login.js";
import type { LogoutRequestDto } from "@contracts/auth/logout.js";
import type { RefreshRequestDto } from "@contracts/auth/refresh.js";

export default class AuthController {
    constructor(private service: AuthService) {}

    async addUser(req: Request, res: Response, next: NextFunction) {
        try {
            const credentials = req.body as RegisterRequestDto;
            
            const { result, userId } = await this.service.register(
                credentials.username, 
                credentials.password, 
                credentials.role
            );

            res.status(200).json({ result, userId });
        } catch (err) {
            next(err);
        }
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const credentials = req.body as RegisterRequestDto;
            
            const { result, userId } = await this.service.register(
                credentials.username, 
                credentials.password, 
                "P",
                {
                    email: credentials.email,
                    phone: credentials.phone || null,
                    first_name: credentials.first_name,
                    last_name: credentials.last_name,
                    patronymic: credentials.patronymic || null,
                    birth_date: credentials.birth_date,
                    gender: credentials.gender,
                }
            );

            res.status(200).json({ result, userId });
        } catch (err) {
            next(err);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const credentials = req.body as LoginRequestDto;
            
            const tokens = await this.service.login(
                credentials.username, 
                credentials.password,
                req.get("User-Agent"),
                req.ip
            );
            if (!tokens) throw new InvalidCredentialsError();
            
            res.status(200).json({
                access_token: tokens.accessToken,
                refresh_token: tokens.refreshToken
            });
        } catch (err) {
            next(err);
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const credentials = req.body as LogoutRequestDto;

            await this.service.logout(credentials.token);
            
            res.status(200).send();
        } catch (err) {
            next(err);
        }
    }

    async refresh(req: Request, res: Response, next: NextFunction) {
        try {
            const credentials = req.body as RefreshRequestDto;

            const newToken = await this.service.refreshToken(credentials.token);
            if (!newToken) throw new InvalidTokenError();

            res.status(200).json({ access_token: newToken });
        } catch (err) {
            next(err);
        }
    }
};