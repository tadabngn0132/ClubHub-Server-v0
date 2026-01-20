import { prisma } from "../libs/prisma.js"
import jwt from "jsonwebtoken"
import { v4 as uuidv4 } from "uuid"
import crypto from "crypto"

export const createRefreshToken = async (userId) => {
    const jti = uuidv4()

    const refreshToken = jwt.sign(
        {
            jti,
            userId: userId,
            type: "refresh",
        },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "15d" }
    );

    await prisma.refreshToken.create({
        data: {
            id: jti,
            userId: userId,
            expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        },
    });

    return refreshToken;
}

export const verifyRefreshToken = async (token) => {
    try {
        const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const storedToken = await prisma.refreshToken.findFirst({
            where: {
                id: decodedToken.jti,
                isRevoked: false,
                expiresAt: {
                    gt: new Date(),
                },
            },
        });

        if (!storedToken) {
            throw new Error("Refresh token is expired or revoked");
        }

        await prisma.refreshToken.update({
            where: { id: decodedToken.jti },
            data: { lastUsedAt: new Date() },
        });

        return storedToken.userId;
    } catch (error) {
        console.error("Error verifying refresh token:", error.message);
        throw new Error("Invalid refresh token");
    }
}

export const revokeRefreshToken = async (jti) => {
    return await prisma.refreshToken.update({
        where: { id: jti },
        data: {
            isRevoked: true,
            revokedAt: new Date(),
        },
    });
}

export const createAccessToken = async (userId) => {
    const accessToken = jwt.sign(
        {
            userId: userId,
            type: "access",
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "30m" }
    )

    return accessToken
}

export const createResetPasswordToken = async (userId) => {
    const resetPasswordToken = uuidv4()
    const resetPasswordHashedToken = crypto.createHash('sha256').update(resetPasswordToken).digest('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.resetPasswordToken.create({
        data: {
            hashedToken: resetPasswordHashedToken,
            expiresAt: expiresAt,
            userId: userId
        }
    })

    return resetPasswordToken
}

export const verifyResetPasswordToken = async (token, userId) => {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

    const storedToken = await prisma.resetPasswordToken.findFirst({
        where: {
            userId: userId,
            hashedToken: hashedToken,
            expiresAt: {
                gt: new Date()
            },
            isUsed: false
        }
    })

    if (!storedToken) {
        throw new Error("Reset token is used or has expired")
    }

    await prisma.resetPasswordToken.update({
        where: {
            id: storedToken.id
        },
        data: {
            isUsed: true,
            usedAt: new Date()
        }
    })

    return true
}