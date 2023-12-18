const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const db = require('../db');


class ProviderModel {
    constructor(
        username,
        uniqueId,
        email,
        mobilenumber,
        address,
        carddetails,
        cvv,
        paypalid,
        aectransfer,
        cardtype,
        cardholdersname,
        cardnumber,
        qualifications,
        yearsofexperience,
        bio,
        bankname,
        accountnumber,
        services,
        hashedPassword,
    ) {
        this.username = username || null;
        this.uniqueId = uniqueId || null;
        this.email = email || null;
        this.mobilenumber = mobilenumber || null;
        this.address = address || null;
        this.carddetails = carddetails || null;
        this.cvv = cvv || null;
        this.paypalid = paypalid || null;
        this.aectransfer = aectransfer || null;
        this.cardtype = cardtype || null;
        this.cardholdersname = cardholdersname || null;
        this.cardnumber = cardnumber || null;
        this.qualifications = qualifications || null;
        this.yearsofexperience = yearsofexperience || null;
        this.bio = bio || null;
        this.bankname = bankname || null;
        this.accountnumber = accountnumber || null;
        this.services = services || [];
        this.hashedPassword = hashedPassword || null;;
    }

    async createProvider() {
        const providersCollection = admin.firestore().collection('providers');

        const existingProviderByEmail = await this.getProviderByField('email', this.email);
        if (existingProviderByEmail) {
            throw new Error('Provider with this email already exists');
        }

        const existingProviderByPhoneNumber = await this.getProviderByField('mobilenumber', this.mobilenumber);
        if (existingProviderByPhoneNumber) {
            throw new Error('Provider with this phone number already exists');
        }

        const providerData = {};

        Object.entries(this).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                providerData[key] = value;
            }
        });

        const newProviderRef = await providersCollection.add(providerData);
        const providerId = newProviderRef.id;

        // Generate uniqueId using UUID
        const uniqueId = uuidv4();

        await newProviderRef.update({ uniqueId });
        return providerId;

    }

    static async getProviderByEmail(email) {
        try {
            const snapshot = await db.collection('providers').where('email', '==', email).get();

            if (snapshot.empty) {
                return null;
            }
            const providerData = snapshot.docs[0].data();

            return providerData;
        } catch (error) {
            console.error('Error getting provider by email:', error);
            throw error;
        }
    }

    async getProviderByField(fieldName, fieldValue) {
        try {
            const providersCollection = admin.firestore().collection('providers');
            const querySnapshot = await providersCollection.where(fieldName, '==', fieldValue).get();

            if (!querySnapshot.empty) {
                return querySnapshot.docs[0].data();
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Error getting provider by ${fieldName}:`, error);
            throw error;
        }
    }
}

module.exports = ProviderModel;
