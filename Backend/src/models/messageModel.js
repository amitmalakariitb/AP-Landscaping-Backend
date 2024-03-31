const admin = require('firebase-admin');

class MessageModel {
    constructor(senderId, receiverId, content, timestamp) {
        this.senderId = senderId || null;
        this.receiverId = receiverId || null;
        this.content = content || '';
        this.timestamp = timestamp || admin.firestore.FieldValue.serverTimestamp();
        this.isDeleted = false; // Add isDeleted field with default value
    }

    async sendMessage(channelId) {
        try {
            const messageData = {
                senderId: this.senderId,
                receiverId: this.receiverId,
                content: this.content,
                timestamp: this.timestamp
            };

            const channelRef = admin.firestore().collection('channels').doc(channelId);
            const messagesCollection = channelRef.collection('messages');
            const newMessageRef = await messagesCollection.add(messageData);
            return newMessageRef.id;
        } catch (error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    // Implement delete message method
    static async deleteMessage(messageId, channelId) {
        try {
            const channelRef = admin.firestore().collection('channels').doc(channelId);
            const messageRef = channelRef.collection('messages').doc(messageId);
            const snapshot = await messageRef.get();

            if (snapshot.exists) {
                await messageRef.delete();
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            throw error;
        }
    }


    static async getMessageById(messageId) {
        try {
            const messageRef = admin.firestore().collection('messages').doc(messageId);
            const snapshot = await messageRef.get();

            if (snapshot.exists) {
                const messageData = snapshot.data();
                messageData.id = snapshot.id;
                return messageData;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error getting message by ID:', error);
            throw error;
        }
    }

    static async getAllMessages() {
        try {
            const messagesCollection = admin.firestore().collection('messages');
            const snapshot = await messagesCollection.get();
            const messages = [];

            snapshot.forEach(doc => {
                const messageData = doc.data();
                messageData.id = doc.id;
                messages.push(messageData);
            });

            return messages;
        } catch (error) {
            console.error('Error getting all messages:', error);
            throw error;
        }
    }

    static async updateMessage(channelId, messageId, updateData) {
        try {
            const channelRef = admin.firestore().collection('channels').doc(channelId);
            const messageRef = channelRef.collection('messages').doc(messageId);
            const snapshot = await messageRef.get();

            if (snapshot.exists) {
                await messageRef.update(updateData);
                return true;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error updating message:', error);
            throw error;
        }
    }

    static async getAllMessagesByChannel(channelId) {
        try {
            const messagesCollection = admin.firestore().collection('channels').doc(channelId).collection('messages');
            const snapshot = await messagesCollection.get();
            const messages = [];

            snapshot.forEach(doc => {
                const messageData = doc.data();
                messageData.id = doc.id;
                messages.push(messageData);
            });

            return messages;
        } catch (error) {
            console.error('Error getting all messages by channel:', error);
            throw error;
        }
    }
}

module.exports = MessageModel;
