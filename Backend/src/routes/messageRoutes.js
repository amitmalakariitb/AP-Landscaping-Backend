const express = require('express');
const router = express.Router();
const { messageController } = require('../controllers');


router.post('/send', messageController.sendMessage);
router.delete('/delete', messageController.deleteMessage);
router.put('/update', messageController.updateMessage);
router.get('/:channelId/messages', messageController.getAllMessagesByChannel);


module.exports = router;
