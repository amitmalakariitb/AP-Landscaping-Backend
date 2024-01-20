const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

class CrewModel {
    constructor(username, email, mobilenumber, address, qualifications, yearsofexperience) {
        this.username = username || null;
        this.email = email || null;
        this.mobilenumber = mobilenumber || null;
        this.address = address || null;
        this.qualifications = qualifications || null;
        this.yearsofexperience = yearsofexperience || null;
    }

    async createCrew(providerId) {
        try {
            const crewsCollection = admin.firestore().collection('crews');

            const existingCrewByEmail = await this.getCrewByField('email', this.email);
            if (existingCrewByEmail) {
                throw new Error('Crew with this email already exists');
            }

            const existingCrewByPhoneNumber = await this.getCrewByField('mobilenumber', this.mobilenumber);
            if (existingCrewByPhoneNumber) {
                throw new Error('Crew with this phone number already exists');
            }


            const crewData = {
                ...this,
                providerId: providerId,
            };

            const newCrewRef = await crewsCollection.add(crewData);
            const crewId = newCrewRef.id;
            return crewId;
        } catch (error) {
            console.error('Error creating crew:', error);
            throw error;
        }
    }

    async getCrewByField(fieldName, fieldValue) {
        try {
            const crewsCollection = admin.firestore().collection('crews');
            const querySnapshot = await crewsCollection.where(fieldName, '==', fieldValue).get();

            if (!querySnapshot.empty) {
                const crews = [];
                querySnapshot.forEach((doc) => {
                    const crewData = doc.data();
                    crewData.id = doc.id;
                    crews.push(crewData);
                });

                return crews;
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Error getting crew by ${fieldName}:`, error);
            throw error;
        }
    }

    static async getCrewById(crewId) {
        try {
            const crewRef = admin.firestore().collection('crews').doc(crewId);
            const snapshot = await crewRef.get();

            if (snapshot.exists) {
                const crewData = snapshot.data();
                crewData.id = snapshot.id;
                return crewData;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting crew by ID:', error);
            throw error;
        }
    }



    static async updateCrew(crewId, updateData) {
        try {
            const crewRef = admin.firestore().collection('crews').doc(crewId);
            const snapshot = await crewRef.get();
            if (snapshot.exists) {
                await crewRef.update(updateData);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error updating crew:', error);
            throw error;
        }
    }

    static async deleteCrew(crewId) {
        try {
            const crewRef = admin.firestore().collection('crews').doc(crewId);
            const snapshot = await crewRef.get();
            if (snapshot.exists) {
                await crewRef.delete();
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error deleting crew:', error);
            throw error;
        }
    }

    static async assignOrderToCrew(crewId, orderId) {
        try {
            const crewRef = admin.firestore().collection('crews').doc(crewId);
            const snapshot = await crewRef.get();
            if (snapshot.exists) {
                await crewRef.update({ assignedOrders: admin.firestore.FieldValue.arrayUnion(orderId) });
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error assigning order to crew:', error);
            throw error;
        }
    }

    static async getAllCrewsByProvider(providerId) {
        try {
            const crewsCollection = admin.firestore().collection('crews');
            const snapshot = await crewsCollection.where('providerId', '==', providerId).get();

            const crews = [];

            snapshot.forEach((doc) => {
                const crewData = doc.data();
                crewData.id = doc.id;
                crews.push(crewData);
            });

            return crews;
        } catch (error) {
            console.error('Error getting all crews by provider:', error);
            throw error;
        }
    }

    async getCrewByField(fieldName, fieldValue) {
        try {
            const crewsCollection = admin.firestore().collection('crews');
            const querySnapshot = await crewsCollection.where(fieldName, '==', fieldValue).get();

            if (!querySnapshot.empty) {
                const crewData = querySnapshot.docs[0].data();
                crewData.id = querySnapshot.docs[0].id;

                return crewData;
            } else {
                return null;
            }
        } catch (error) {
            console.error(`Error getting crew by ${fieldName}:`, error);
            throw error;
        }
    }
}

module.exports = CrewModel;
