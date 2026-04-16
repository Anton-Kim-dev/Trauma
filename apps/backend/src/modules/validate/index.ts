import { ZodType } from "zod";
import type { Request, Response, NextFunction } from "express";
import { AuthHandler } from "@modules/auth_handler";
import { JWTCheckResult } from "@custom_types/jwtcheckresult";
import type { UserRole } from "@custom_types/userroles";
import { SchemaMismatchError } from "@errors/schemamismatch";
import { MissingAuthHeaderError } from "@errors/missingauthheader";
import { InvalidTokenError } from "@errors/invalidtoken";
import { ExpiredTokenError } from "@errors/expiredtoken";
import { UnauthorizedError } from "@errors/unauthorized";

export const validateBody = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return next(new SchemaMismatchError());

    req.body = parsed.data;
    next();
};

export const validateQuery = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) return next(new SchemaMismatchError());

    req.parsedQuery = parsed.data as Record<string, string>;
    next();
};

export const validateAuth =  () => (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) return next(new MissingAuthHeaderError());

    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) return next(new MissingAuthHeaderError());

    const tokenValidationResult = AuthHandler.checkAccessToken(token);
    if (tokenValidationResult.result === JWTCheckResult.Invalid) {
        return next(new InvalidTokenError());
    } else if (tokenValidationResult.result === JWTCheckResult.Expired) {
        return next(new ExpiredTokenError());
    }

    req.user = tokenValidationResult.data!;
    next();
};

export const validateUserRole = (...allowedRoles: UserRole[]) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!allowedRoles.includes(req.user.user_role)) return next(new UnauthorizedError());
    next();
};