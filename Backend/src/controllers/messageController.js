const { MessageModel } = require('../models');
const { ChannelModel } = require('../models');

async function sendMessage(req, res) {
    try {
        const { senderId, receiverId, content } = req.body;

        // Check if senderId and receiverId are provided
        if (!senderId || !receiverId || !content) {
            return res.status(400).json({ error: 'senderId, receiverId, and content are required' });
        }

        // Check if senderId and receiverId are not the same
        if (senderId === receiverId) {
            return res.status(400).json({ error: 'senderId and receiverId cannot be the same' });
        }

        // Find or create the channel
        let channelId;
        const existingChannel = await ChannelModel.getFirstChannel(senderId, receiverId);
        if (!existingChannel) {
            const newChannel = new ChannelModel([senderId, receiverId]);
            channelId = await newChannel.createChannel();
        } else {
            channelId = existingChannel.id;
        }

        // Create and send the message
        const newMessage = new MessageModel(senderId, receiverId, content);
        const messageId = await newMessage.sendMessage(channelId);

        // Add the message to the channel
        await ChannelModel.addMessageToChannel(channelId, messageId);

        // Send response
        res.status(201).json({ messageId, channelId, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function deleteMessage(req, res) {
    try {
        const { messageId, channelId } = req.body; // Assuming channelId is also part of the request parameters
        const deleted = await MessageModel.deleteMessage(messageId, channelId); // Pass both messageId and channelId
        if (deleted) {
            res.status(200).json({ message: 'Message deleted successfully' });
        } else {
            res.status(404).json({ error: 'Message not found' });
        }
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




async function updateMessage(req, res) {
    try {
        const { channelId, messageId, updateData } = req.body; // Assuming channelId, messageId, and updateData are in the request body
        const updated = await MessageModel.updateMessage(channelId, messageId, updateData); // Pass channelId, messageId, and updateData
        if (updated) {
            res.status(200).json({ message: 'Message updated successfully' });
        } else {
            res.status(404).json({ error: 'Message not found' });
        }
    } catch (error) {
        console.error('Error updating message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function getAllMessagesByChannel(req, res) {
    try {
        const { channelId } = req.params;

        // Check if channelId is provided
        if (!channelId) {
            return res.status(400).json({ error: 'Channel ID is required' });
        }

        // Retrieve all messages for the given channel ID
        const messages = await MessageModel.getAllMessagesByChannel(channelId);

        // Sort messages by timestamp in ascending order (oldest first)
        messages.sort((a, b) => a.timestamp - b.timestamp);

        // Send response with messages
        res.status(200).json({ messages });
    } catch (error) {
        console.error('Error getting messages by channel:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports = { sendMessage, deleteMessage, updateMessage, getAllMessagesByChannel };
