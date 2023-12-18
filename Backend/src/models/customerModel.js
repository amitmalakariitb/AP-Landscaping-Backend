const admin = require('firebase-admin');
const db = require('../db');

class CustomerModel {
    constructor(username, email, mobilenumber, address, carddetails, cvv, paypalid, aectransfer, cardtype, cardholdersname, cardnumber, hashedPassword) {
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

            return customerData;
        } catch (error) {
            console.error('Error getting customer by email:', error);
            throw error;
        }
    }
    async getCustomerByField(fieldName, fieldValue) {
        const customersCollection = admin.firestore().collection('customers');
        const querySnapshot = await customersCollection.where(fieldName, '==', fieldValue).get();

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data();
        } else {
            return null;
        }
    }
}

module.exports = CustomerModel;
