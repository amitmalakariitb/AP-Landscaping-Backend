const db = require('../db');

class SuperuserModel {
    constructor(username, email, hashedPassword) {
        this.username = username;
        this.email = email;
        this.hashedPassword = hashedPassword;
    }

    async createSuperuser() {
        try {
            const newUserRef = await db.collection('superusers').add({
                username: this.username,
                email: this.email,
                hashedPassword: this.hashedPassword
            });
            return newUserRef.id;
        } catch (error) {
            console.error('Error creating superuser:', error);
            throw error;
        }
    }

    static async getSuperuserByEmail(email) {
        try {
            const querySnapshot = await db.collection('superusers').where('email', '==', email).get();

            if (querySnapshot.empty) {
                return null;
            }

            const superuserData = querySnapshot.docs[0].data();
            superuserData.id = querySnapshot.docs[0].id;

            return superuserData;
        } catch (error) {
            console.error('Error getting superuser by email:', error);
            throw error;
        }
    }

    static async getSuperuserById(superuserId) {
        try {
            const superuserDoc = await db.collection('superusers').doc(superuserId).get();

            if (!superuserDoc.exists) {
                return null;
            }

            const superuserData = superuserDoc.data();
            superuserData.id = superuserDoc.id;

            return superuserData;
        } catch (error) {
            console.error('Error getting superuser by ID:', error);
            throw error;
        }
    }
}

module.exports = SuperuserModel;
