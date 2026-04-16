import { env } from "@config/env.js";
import AuthRepository from "./repository.js";
import { AuthHandler } from "@modules/auth_handler";
import { PasswordHandler } from "@modules/password";
import { RegisterResult } from "@contracts/auth/register.js";
import type { UserRole } from "@custom_types/userroles";
import type { VolatilePatientInfo } from "@custom_types/volatilepatientinfo.js";
import type { HTTPClient } from "@modules/client/index.js";

export default class AuthService {
    constructor(private repo: AuthRepository, private usersClient: HTTPClient) {}

    async register(name: string, pass: string, role: 'P' | 'D' | 'A', profileData?: VolatilePatientInfo): Promise<{
        result: RegisterResult,
        userId: string | null
    }> {
        const userInfo = await this.repo.getUserByName(name);
        if (userInfo) return { result: RegisterResult.Duplicate, userId: null };

        const passHash = PasswordHandler.hash(pass);
        const userId = await this.repo.addUser(name, passHash, role);
        if (!userId) return { result: RegisterResult.Error, userId: null };

        if (role === 'P' && profileData && env.USERS_SERVICE_URL) {
            try {
                const accessToken = AuthHandler.generateAccessToken({
                    user_id: userId,
                    user_name: name,
                    user_role: 'P' as UserRole,
                });
                await this.usersClient.post('/users/patients/update', profileData, {
                    headers: {
                        "Authorization": `Bearer ${accessToken}`
                    }
                });
            } catch (err) {
                await this.repo.deleteUser(userId).catch(() => {});
                return { result: RegisterResult.Error, userId: null };
            }
        }

        return { result: RegisterResult.Success, userId };
    }

    async login(name: string, pass: string, userAgent?: string, userIp?: string): Promise<{
        refreshToken: string,
        accessToken: string
    } | null> {
        const userAuthData = await this.repo.getUserByName(name);
        if (!userAuthData) return null;
        if (!PasswordHandler.compare(userAuthData.passHash, pass)) return null;

        const refreshTokenData = AuthHandler.generateRefreshToken();
        const refreshTokenHash = AuthHandler.hashToken(refreshTokenData.token);
        const tokenInsertResult = await this.repo.addRefreshToken(
            userAuthData.userId, 
            refreshTokenHash, 
            refreshTokenData.exp,
            userAgent,
            userIp
        );
        if (!tokenInsertResult) return null;

        const accessToken = AuthHandler.generateAccessToken({
            user_id: userAuthData.userId,
            user_name: name,
            user_role: userAuthData.role as UserRole
        });

        return {
            accessToken,
            refreshToken: refreshTokenData.token
        };
    }

    async logout(token: string): Promise<boolean> {
        const tokenHash = AuthHandler.hashToken(token);
        const tokenDeleteResult = await this.repo.deleteRefreshToken(tokenHash);
        return tokenDeleteResult; 
    }

    async refreshToken(token: string): Promise<string | null> {
        const tokenHash = AuthHandler.hashToken(token);
        const tokenData = await this.repo.getRefreshTokenByHash(tokenHash);
        
        if (!tokenData) return null;
        if (tokenData.revoked || new Date(tokenData.exp) < new Date()) {
            await this.repo.deleteRefreshToken(tokenHash);
            return null;
        }

        const userInfo = await this.repo.getUserById(tokenData.userId);
        if (!userInfo) return null;
        
        const newToken = AuthHandler.generateAccessToken({
            user_id: tokenData.userId,
            user_name: userInfo.name,
            user_role: userInfo.role as UserRole
        });
        return newToken;
    }
}