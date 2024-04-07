const socketIo = require('socket.io');

let io;

function initWebSocket(server) {
    io = socketIo(server);

    io.on('connection', (socket) => {
        console.log('A user connected');

        // Handle new message event
        socket.on('sendMessage', (messageData) => {
            io.emit('newMessage', messageData); // Emit the new message event to all connected clients
        });

        // Handle delete message event
        socket.on('deleteMessage', (messageId) => {
            io.emit('deletedMessage', messageId); // Emit the deleted message event to all connected clients
        });

        // Handle update message event
        socket.on('updateMessage', (messageData) => {
            io.emit('updatedMessage', messageData); // Emit the updated message event to all connected clients
        });

        // Handle new channel event
        socket.on('createChannel', (channelData) => {
            io.emit('newChannel', channelData); // Emit the new channel event to all connected clients
        });

        // Handle disconnect event
        socket.on('disconnect', () => {
            console.log('A user disconnected');
        });
    });
}

module.exports = { initWebSocket };
