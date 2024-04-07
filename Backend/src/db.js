const admin = require('firebase-admin');
require('dotenv').config();

const firebaseAdminSdkPath = process.env.FIREBASE_ADMIN_SDK_PATH;

if (!firebaseAdminSdkPath) {
    throw new Error('FIREBASE_ADMIN_SDK_PATH environment variable is not defined.');
}

const serviceAccount = require(firebaseAdminSdkPath);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
