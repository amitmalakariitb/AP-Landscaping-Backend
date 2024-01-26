const admin = require('firebase-admin');
const db = require('../db');

class TokenModel {
    static async addToBlacklist(token, userId, userType) {
        const blacklistCollection = admin.firestore().collection('tokenBlacklist');

        await blacklistCollection.add({
            token,
            userId,
            userType,
            invalidatedAt: new Date()
        });
    }

    static async isTokenBlacklisted(token) {
        const blacklistCollection = admin.firestore().collection('tokenBlacklist');
        const snapshot = await blacklistCollection.where('token', '==', token).get();

        return !snapshot.empty;
    }

    static async saveResetToken(customerId, resetToken, otp, expirationTime) {
        try {
            const resetTokensCollection = admin.firestore().collection('resetTokens');
            await resetTokensCollection.doc(customerId).set({ resetToken, otp, expirationTime });
        } catch (error) {
            console.error('Error saving reset token:', error);
            throw error;
        }
    }

    static async isTokenValid(customerId, resetToken) {
        try {
            const resetTokensCollection = admin.firestore().collection('resetTokens');
            const snapshot = await resetTokensCollection.doc(customerId).get();

            if (snapshot.exists) {
                const tokenData = snapshot.data();
                return tokenData.resetToken === resetToken && tokenData.expirationTime > Date.now();
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error checking token validity:', error);
            throw error;
        }
    }

    static async getOTP(customerId) {
        try {
            const resetTokensCollection = admin.firestore().collection('resetTokens');
            const snapshot = await resetTokensCollection.doc(customerId).get();

            if (snapshot.exists) {
                const tokenData = snapshot.data();
                return tokenData.otp;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting OTP:', error);
            throw error;
        }
    }

    static async removeResetToken(customerId) {
        try {
            const resetTokensCollection = admin.firestore().collection('resetTokens');
            await resetTokensCollection.doc(customerId).delete();
        } catch (error) {
            console.error('Error removing reset token:', error);
            throw error;
        }
    }

    static async removeOTP(customerId) {
        try {
            const resetTokensCollection = admin.firestore().collection('resetTokens');
            await resetTokensCollection.doc(customerId).update({ otp: null });
        } catch (error) {
            console.error('Error removing OTP:', error);
            throw error;
        }
    }
}

module.exports = TokenModel;
