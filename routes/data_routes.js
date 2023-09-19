const express = require('express');
const router = express.Router();
const { DurianData } = require('../db');


// Define your /receive-data route here
// API endpoint to receive and store data
router.post('/', (req, res) => {
	const {
		country,
		postCode,
		farmID,
		treeID,
		durianType,
		durianID,
		harvestTime,
		workerID
	} = req.body;

	const newDurianData = new DurianData({
		country,
		postCode,
		farmID,
		treeID,
		durianType,
		durianID,
		harvestTime,
		workerID
	});

	newDurianData.save()
		.then(() => {
            logger.info('Data saved to MongoDB'); // Log success
			res.status(200).send('Data received and saved successfully');
		})
		.catch(err => {
			logger.error('Error saving data to MongoDB:', err); // Log error
			res.status(500).send('Error saving data to MongoDB');
		});
});


// Create a middleware to check the request's origin
// function validateRequestOrigin(req, res, next) {
//     const allowedOrigins = ['http://your-mobile-app.com']; // Replace with your app's URL
  
//     const origin = req.headers.origin;
//     if (allowedOrigins.includes(origin)) {
//       // Allow the request if it comes from an approved origin
//       next();
//     } else {
//       res.status(403).json({ message: 'Access denied.' });
//     }
//   }
  
//   // Apply the middleware to your /receive-data route
//   router.post('/receive-data', validateRequestOrigin, (req, res) => {
//     // Your /receive-data route logic here
//   });
  


module.exports = router;
