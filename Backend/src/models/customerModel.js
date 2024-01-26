const admin = require('firebase-admin');
const db = require('../db');

class CustomerModel {
    constructor(username, email, mobilenumber, address, carddetails, cvv, paypalid, aectransfer, cardtype, cardholdersname, cardnumber, hashedPassword, googleId) {
        this.username = username || null;
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
        this.hashedPassword = hashedPassword || null;
        this.googleId = googleId || null;
    }

    async createCustomer() {

        const customersCollection = admin.firestore().collection('customers');

        const existingCustomerByEmail = await this.getCustomerByField('email', this.email);
        if (existingCustomerByEmail) {
            throw new Error('Customer with this email already exists');
        }

        const existingCustomerByPhoneNumber = await this.getCustomerByField('mobilenumber', this.mobilenumber);
        if (existingCustomerByPhoneNumber) {
            throw new Error('Customer with this phone number already exists');
        }

        const customerData = {};

        Object.entries(this).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                customerData[key] = value;
            }
        });

        const newCustomerRef = await customersCollection.add(customerData);
        return newCustomerRef.id;
    }

    static async getCustomerByEmail(email) {
        try {
            const snapshot = await db.collection('customers').where('email', '==', email).get();

            if (snapshot.empty) {
                return null;
            }
            const customerData = snapshot.docs[0].data();
            customerData.id = snapshot.docs[0].id;

            return customerData;
        } catch (error) {
            console.error('Error getting customer by email:', error);
            throw error;
        }
    }
    static async getCustomerByPhoneNumber(mobilenumber) {
        try {
            const snapshot = await db.collection('customers').where('mobilenumber', '==', mobilenumber).get();

            if (snapshot.empty) {
                return null;
            }
            const customerData = snapshot.docs[0].data();
            customerData.id = snapshot.docs[0].id;

            return customerData;
        } catch (error) {
            console.error('Error getting customer by mobile number:', error);
            throw error;
        }
    }
    static async getCustomerById(id) {
        try {
            const customerRef = admin.firestore().collection('customers').doc(id);
            const snapshot = await customerRef.get();

            if (snapshot.exists) {
                const customerData = snapshot.data();
                customerData.id = snapshot.id;
                return customerData;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting customer by ID:', error);
            throw error;
        }
    }

    async getCustomerByField(fieldName, fieldValue) {
        const customersCollection = admin.firestore().collection('customers');
        const querySnapshot = await customersCollection.where(fieldName, '==', fieldValue).get();

        if (!querySnapshot.empty) {
            const customerData = querySnapshot.docs[0].data();
            customerData.id = querySnapshot.docs[0].id;

            return customerData;
        } else {
            return null;
        }
    }

    static async updateCustomer(id, updateData) {
        try {
            const customerRef = admin.firestore().collection('customers').doc(id);
            const snapshot = await customerRef.get();
            if (snapshot.exists) {
                await customerRef.update(updateData);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    static async createCustomerFromGoogle(profile) {
        const existingCustomerByGoogleId = await this.getCustomerByField('googleId', profile.id);
        if (existingCustomerByGoogleId) {
            return existingCustomerByGoogleId;
        }

        const customerData = {
            username: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
        };
        console.log(customerData)
        const customersCollection = admin.firestore().collection('customers');
        const newCustomerRef = await customersCollection.add(customerData);
        return newCustomerRef.id;
    }

}

module.exports = CustomerModel;
