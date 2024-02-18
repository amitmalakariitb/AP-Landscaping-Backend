// locationController.js
const axios = require('axios');

exports.getLocation = async (req, res) => {
    try {
        const address = req.query.address; // Get address from query params

        // Make request to Google Maps Geocoding API
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: address,
                key: process.env.GOOGLE_MAPS_API_KEY // Use environment variable for API key
            }
        });
        console.log(response)

        // Extract relevant data from response
        const location = response.data.results[0].geometry.location;

        res.json(location);
    } catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
