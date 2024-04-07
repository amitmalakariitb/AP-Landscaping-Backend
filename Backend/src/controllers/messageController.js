const { initWebSocket } = require('../middlewares/webSocket');
const { MessageModel } = require('../models');
const { ChannelModel } = require('../models');


let io;

function initializeWebSocket(server) {
    io = initWebSocket(server);
}
async function sendMessage(req, res) {
    try {
        const { senderId, receiverId, content } = req.body;

        if (!senderId || !receiverId || !content) {
            return res.status(400).json({ error: 'senderId, receiverId, and content are required' });
        }

        if (senderId === receiverId) {
            return res.status(400).json({ error: 'senderId and receiverId cannot be the same' });
        }

        let channelId;
        const existingChannel = await ChannelModel.getFirstChannel(senderId, receiverId);
        if (!existingChannel) {
            const newChannel = new ChannelModel([senderId, receiverId]);
            channelId = await newChannel.createChannel();
        } else {
            channelId = existingChannel.id;
        }

        const newMessage = new MessageModel(senderId, receiverId, content);
        const messageId = await newMessage.sendMessage(channelId);

        await ChannelModel.addMessageToChannel(channelId, messageId);
        io.emit('newMessage', {
            messageId,
            senderId,
            receiverId,
            content,
            timestamp: newMessage.timestamp
        });


        res.status(201).json({ messageId, channelId, message: 'Message sent successfully' });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteMessage(req, res) {
    try {
        const { messageId, channelId } = req.body;
        const deleted = await MessageModel.deleteMessage(messageId, channelId);
        if (deleted) {
            io.emit('deletedMessage', messageId);
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
        const { channelId, messageId, updateData } = req.body;
        const updated = await MessageModel.updateMessage(channelId, messageId, updateData);
        if (updated) {
            io.emit('updatedMessage', {
                messageId,
                channelId,
                updateData
            });

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

        if (!channelId) {
            return res.status(400).json({ error: 'Channel ID is required' });
        }

        const messages = await MessageModel.getAllMessagesByChannel(channelId);

        messages.sort((a, b) => a.timestamp - b.timestamp);

        res.status(200).json({ messages });
    } catch (error) {
        console.error('Error getting messages by channel:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function getAllChannelsForUser(req, res) {
    try {
        let userId;

        if (req.user.providerId) {
            userId = req.user.providerId;
        } else if (req.user.customerId) {
            userId = req.user.customerId;
        } else if (req.user.superuserId) {
            userId = req.user.superuserId;
        } else {
            return res.status(400).json({ error: 'Invalid user type' });
        }

        const channels = await ChannelModel.getAllChannelsForUser(userId);

        res.status(200).json({ channels });
    } catch (error) {
        console.error('Error getting channels for user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




module.exports = { sendMessage, deleteMessage, updateMessage, getAllMessagesByChannel, getAllChannelsForUser };
