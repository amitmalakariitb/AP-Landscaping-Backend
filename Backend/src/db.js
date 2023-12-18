const admin = require('firebase-admin');

const serviceAccount = require('../ap-landscaping-firebase-adminsdk-51cc5-ae3931fc8f.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = db;
