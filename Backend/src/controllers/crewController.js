const { CrewModel, OrderModel } = require('../models');

async function createCrew(req, res) {
    try {
        const providerId = req.user.providerId;
        const { username, email, mobilenumber, address, qualifications, yearsofexperience } = req.body;

        const newCrew = new CrewModel(username, email, mobilenumber, address, qualifications, yearsofexperience);
        const crewId = await newCrew.createCrew(providerId);

        res.status(201).json({ crewId, message: 'Crew created successfully!' });
    } catch (error) {
        console.error('Error creating crew:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function updateCrew(req, res) {
    try {
        const { crewId } = req.params;
        const updateData = req.body;

        const isUpdated = await CrewModel.updateCrew(crewId, updateData);

        if (isUpdated) {
            res.status(200).json({ message: 'Crew updated successfully!' });
        } else {
            res.status(404).json({ error: 'Crew not found' });
        }
    } catch (error) {
        console.error('Error updating crew:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function deleteCrew(req, res) {
    try {
        const { crewId } = req.params;

        const isDeleted = await CrewModel.deleteCrew(crewId);

        if (isDeleted) {
            res.status(200).json({ message: 'Crew deleted successfully!' });
        } else {
            res.status(404).json({ error: 'Crew not found' });
        }
    } catch (error) {
        console.error('Error deleting crew:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

async function assignOrderToCrew(req, res) {
    try {
        const { crewId } = req.params;
        const { orderId } = req.body;

        const crew = await CrewModel.getCrewById(crewId);
        if (!crew) {
            return res.status(404).json({ error: 'Crew not found' });
        }

        const order = await OrderModel.getOrderById(orderId);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const isAssigned = await CrewModel.assignOrderToCrew(crewId, orderId);

        if (isAssigned) {
            await OrderModel.updateOrder(orderId, { crewId });

            res.status(200).json({ message: 'Order assigned to crew successfully!' });
        } else {
            res.status(404).json({ error: 'Crew not found' });
        }
    } catch (error) {
        console.error('Error assigning order to crew:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function getAllCrewsByProvider(req, res) {
    try {
        const providerId = req.user.providerId;

        const crews = await CrewModel.getAllCrewsByProvider(providerId);

        res.status(200).json({ crews });
    } catch (error) {
        console.error('Error getting all crews by provider:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

module.exports = { createCrew, updateCrew, deleteCrew, assignOrderToCrew, getAllCrewsByProvider };
