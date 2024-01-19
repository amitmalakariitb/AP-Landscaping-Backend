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
}

module.exports = TokenModel;
