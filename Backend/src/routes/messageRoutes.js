const express = require('express');
const router = express.Router();
const { messageController } = require('../controllers');
const authenticate = require('../middlewares/authMiddleware');


router.post('/send', authenticate, messageController.sendMessage);
router.delete('/delete', authenticate, messageController.deleteMessage);
router.put('/update', authenticate, messageController.updateMessage);
router.get('/:channelId/messages', authenticate, messageController.getAllMessagesByChannel);
router.get('/allChannels', authenticate, messageController.getAllChannelsForUser);

module.exports = router;
