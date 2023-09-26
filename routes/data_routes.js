const express = require('express');
const router = express.Router();
const { DurianData } = require('../db');
const logger = require('../logger')


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
		scanTime,
		firstPlant,
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
		scanTime,
		firstPlant,
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
  

module.exports = router;
