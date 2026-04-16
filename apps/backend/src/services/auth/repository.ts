import { Database } from "@modules/database";
import { DatabaseError } from "pg";

export default class AuthRepository {
    constructor(private db: Database) {}

    async getRefreshTokenByHash(tokenHash: string): Promise<{
        tokenId: string,
        userId: string,
        exp: Date,
        revoked: boolean
    } | null> {
        try {
            const tokenHashQueryResult = await this.db.query(
                "SELECT id, user_id, expires_at, revoked \
                FROM refresh_tokens \
                WHERE token_hash = $1",
                [tokenHash]
            );
            if (!tokenHashQueryResult.rows[0]) return null;
            return {
                tokenId: tokenHashQueryResult.rows[0].id,
                userId: tokenHashQueryResult.rows[0].user_id,
                exp: tokenHashQueryResult.rows[0].expires_at,
                revoked: tokenHashQueryResult.rows[0].revoked
            };
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return null;
        }
    }

    async addRefreshToken(userId: string, token: string, exp: Date, userAgent?: string, userIp?: string): Promise<boolean> {
        try {
            await this.db.query(
                "INSERT INTO refresh_tokens (user_id, token_hash, expires_at, user_agent, user_ip) \
                VALUES ($1, $2, $3, $4, $5)",
                [userId, token, exp, userAgent, userIp]
            );
            return true;
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return false;
        }
    }
    
    async deleteRefreshToken(tokenHash: string): Promise<boolean> {
        try {
            const deleteTokenQueryResult = await this.db.query(
                "DELETE FROM refresh_tokens \
                WHERE token_hash = $1",
                [tokenHash]
            );
            return deleteTokenQueryResult.rowCount !== null && deleteTokenQueryResult.rowCount > 0;
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return false;
        }
    }

    async getUserByName(name: string): Promise<{
        userId: string,
        passHash: string,
        role: string
    } | null> {
        try {
            const userInfoQueryResult = await this.db.query(
                "SELECT id, passhash, role_id \
                FROM users \
                WHERE username = $1",
                [name]
            );
            if (!userInfoQueryResult.rows[0]) return null;
            return {
                userId: userInfoQueryResult.rows[0].id,
                passHash: userInfoQueryResult.rows[0].passhash,
                role: userInfoQueryResult.rows[0].role_id
            };
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return null;
        }
    }

    async getUserById(userId: string): Promise<{
        name: string,
        passHash: string,
        role: string
    } | null> {
        try {
            const userInfoQueryResult = await this.db.query(
                "SELECT username, passhash, role_id \
                FROM users \
                WHERE id = $1",
                [userId]
            );
            if (!userInfoQueryResult.rows[0]) return null;
            return {
                name: userInfoQueryResult.rows[0].username,
                passHash: userInfoQueryResult.rows[0].passhash,
                role: userInfoQueryResult.rows[0].role_id
            };
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return null;
        }
    }

    async addUser(name: string, passHash: string, roleId: 'P' | 'D' | 'A'): Promise<string | null> {
        try {
            const insertUserQueryResult = await this.db.query(
                "INSERT INTO users (username, passhash, role_id) \
                VALUES ($1, $2, $3) \
                RETURNING id",
                [name, passHash, roleId]
            );
            return insertUserQueryResult.rows[0]!.id;
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return null;
        }
    }

    async deleteUser(name: string): Promise<boolean> {
        try {
            const deleteUserQueryResult = await this.db.query(
                "DELETE FROM users \
                WHERE username = $1",
                [name]
            );
            return deleteUserQueryResult.rowCount !== null && deleteUserQueryResult.rowCount > 0;
        } catch (err) {
            if (err instanceof Error || err instanceof DatabaseError) {
                console.log(err);
            }
            return false;
        }
    }
}