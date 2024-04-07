const admin = require('firebase-admin');
const { initWebSocket } = require('../middlewares/webSocket');


let io;

function initializeWebSocket(server) {
    io = initWebSocket(server);
}
class ChannelModel {
    constructor(users, messages) {
        this.users = users || [];
        this.messages = messages || [];
    }

    async createChannel() {
        try {
            const { users, messages } = this;
            const channelId = users.sort().join('_');
            const channelsCollection = admin.firestore().collection('channels');
            const newChannelRef = await channelsCollection.doc(channelId).set({ users, messages });
            io.emit('channelCreated', { channelId, users, messages });
            return channelId;
        } catch (error) {
            console.error('Error creating channel:', error);
            throw error;
        }
    }



    static async getChannelById(channelId) {
        try {
            const channelRef = admin.firestore().collection('channels').doc(channelId);
            const snapshot = await channelRef.get();

            if (snapshot.exists) {
                const channelData = snapshot.data();
                channelData.id = snapshot.id;
                return channelData;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting channel by ID:', error);
            throw error;
        }
    }

    static async getAllChannels() {
        try {
            const channelsCollection = admin.firestore().collection('channels');
            const snapshot = await channelsCollection.get();
            const channels = [];

            snapshot.forEach(doc => {
                const channelData = doc.data();
                channelData.id = doc.id;
                channels.push(channelData);
            });

            return channels;
        } catch (error) {
            console.error('Error getting all channels:', error);
            throw error;
        }
    }

    static async updateChannel(channelId, updateData) {
        try {
            const channelRef = admin.firestore().collection('channels').doc(channelId);
            const snapshot = await channelRef.get();
            if (snapshot.exists) {
                await channelRef.update(updateData);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error updating channel:', error);
            throw error;
        }
    }

    static async getFirstChannel(senderId, receiverId) {
        try {
            const userPair = [senderId, receiverId].sort().join('-'); // Unique identifier for the user pair
            const querySnapshot = await admin.firestore()
                .collection('channels')
                .where('userPair', '==', userPair)
                .get();

            if (!querySnapshot.empty) {
                const channelData = querySnapshot.docs[0].data();
                channelData.id = querySnapshot.docs[0].id;
                return channelData;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting first channel:', error);
            throw error;
        }
    }




    static async addMessageToChannel(channelId, messageId) {
        try {
            const channelRef = admin.firestore().collection('channels').doc(channelId);
            await channelRef.update({
                messages: admin.firestore.FieldValue.arrayUnion(messageId)
            });
        } catch (error) {
            console.error('Error adding message to channel:', error);
            throw error;
        }
    }

    static async getAllChannelsForUser(userId) {
        try {
            const snapshot = await admin.firestore().collection('channels').where('users', 'array-contains', userId).get();

            const channels = [];
            snapshot.forEach(doc => {
                const channelData = doc.data();
                channelData.id = doc.id;
                channels.push(channelData);
            });

            return channels;
        } catch (error) {
            console.error('Error getting channels for user:', error);
            throw error;
        }
    }
}



module.exports = ChannelModel;
