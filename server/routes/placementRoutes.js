const express = require('express');
const router = express.Router();

// Route to get placement prediction from Python Microservice
// POST /api/placement/predict
router.post('/predict', async (req, res) => {
    try {
        const studentMetrics = req.body;

        // Ensure required fields are present
        const requiredFields = ['DSA_Skill', 'GP', 'Internships', 'Active_Backlogs', 'Tenth_Marks', 'Twelfth_Marks'];
        for (const field of requiredFields) {
            if (studentMetrics[field] === undefined) {
                return res.status(400).json({ message: `Missing required metric: ${field}` });
            }
        }

        // Call Python Microservice
        // Use environment variable if available, otherwise default to localhost:8000
        const pythonServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8000';

        const response = await fetch(`${pythonServiceUrl}/predict`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(studentMetrics),
        });

        let responseData;
        try {
            responseData = await response.json();
        } catch (parseError) {
            responseData = { message: 'Invalid response from ML service' };
        }

        if (!response.ok) {
            return res.status(response.status).json(responseData);
        }

        // Return prediction to the frontend
        res.status(200).json(responseData);

    } catch (error) {
        console.error('Error getting placement prediction:', error.message);
        res.status(500).json({ message: 'Internal Server Error while connecting to ML service' });
    }
});

module.exports = router;
