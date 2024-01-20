const express = require('express');
const authenticate = require('../middlewares/authMiddleware');
const { crewController } = require('../controllers');

const router = express.Router();

router.post('/create', authenticate, crewController.createCrew);
router.put('/update/:crewId', authenticate, crewController.updateCrew);
router.delete('/delete/:crewId', authenticate, crewController.deleteCrew);
router.post('/assignOrder/:crewId', authenticate, crewController.assignOrderToCrew);
router.get('/getAllByProvider', authenticate, crewController.getAllCrewsByProvider);

module.exports = router;
