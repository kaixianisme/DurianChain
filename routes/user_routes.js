const express = require('express');
const router = express.Router();
const { DurianData, Review , ApprovedReview} = require('../db');
const { web3,contractAddress, abi, contract, privateKey, account, gasPrice} = require('../myweb3');
const expressWinston = require('express-winston');
const {transports, format } = require('winston');
const schedule = require('node-schedule');

// Store the reference to the job
let cronJob;

const logger = require('../logger')

router.use(expressWinston.logger({
	winstonInstance: logger,
	statusLevels: true
}))

router.get('/error', (req, res) => {
	throw new Error('This is a custom error')
})

const myFormat = format.printf(({level, meta, timestamp}) => {
	return `${timestamp} ${level} ${meta.message}`
}) 

router.use(expressWinston.errorLogger({
	transports: [
		new transports.File({
			filename: 'logsInternalErrors.log'
		})
	],
	format: format.combine(
		format.json(),
		format.timestamp(),
		myFormat
	)
}))

// Error handling middleware
router.use((err, req, res, next) => {
	logger.error(`Error: ${err.message}`);
	res.status(500).send('Something went wrong.');
});


// Define your user-specific routes here
router.get('/', (req, res) => {
	// Redirect to 'DurianTypes.ejs' page
	logger.info('Request received for /');
	res.redirect('/DurianTypes'); // Assuming 'DurianTypes' is the route for 'DurianTypes.ejs'
});


// API endpoint to receive and store data
router.post('/receive-data', (req, res) => {
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




// API endpoint to get all data from the database
router.get('/get-all-data', (req, res) => {
	logger.info(`GET request received on /get-all-data from IP: ${req.ip}`);
	DurianData.find({})
		.then(data => {
			res.status(200).json(data);
		})
		.catch(err => {
			logger.error('Error fetching data from MongoDB:', err); // Log error
			res.status(500).send('Error fetching data from MongoDB');
		});
});


// #TODO Try to only let authorized user access such as localhost
// Endpoint to transfer data from MongoDB to Ethereum smart contract
router.get('/transfer-data', async (req, res) => {
	try {
		const dataFromMongoDB = await DurianData.find(); // Fetch all data from MongoDB

		// Loop through the data and send it to the smart contract
		for (const data of dataFromMongoDB) {
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
				workerID,
			} = data;

			// Create a transaction object
			const transactionObject = {
				from: account.address,
				to: contractAddress,
				gas: 2000000, // Adjust gas limit as needed
				gasPrice,     // Set a high gas price
				data: contract.methods
					.addDurian(
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
					)
					.encodeABI(),
			};

			// Sign the transaction
			const signedTransaction = await web3.eth.accounts.signTransaction(
				transactionObject,
				privateKey
			);

			// Send the signed transaction
			await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
		}

		// After successful transfer, delete data from MongoDB
		DurianData.deleteMany({})
			.then(() => {
				logger.info('All data removed from MongoDB'); // Log success
				res.status(200).send('Data transferred to the smart contract and removed from MongoDB');
			})
			.catch(err => {
				logger.error('Error removing data from MongoDB:', err); // Log error
				res.status(500).send('Error removing data from MongoDB');
			});
	} catch (error) {
		logger.error('Error transferring data to the smart contract:', error); // Log error
		res.status(500).send('Error transferring data to the smart contract');
	}
});


// Define a mapping function for durianType values
function getDurianTypeName(durianType) {
	switch (durianType) {
		case 1:
			return "Musang King (Mao Shan Wang)";
		case 2:
			return "D24";
		case 3:
			return "Black Thorn";
		case 4:
			return "Red Prawn (Ang Hae)"
		case 5:
			return "Golden Phoenix (Jin Feng)"
		case 6:
			return "D101"
		case 7:
			return "XO"
		case 8:
			return "Hor Lor (Hei Law)"
		case 9:
			return "Green Bamboo (Tekka)"
		case 10:
			return "Mornthong"
		case 11:
			return "Kanyao"
		case 12:
			return "Chanee"
		default:
			return "Unknown";
	}
}

function calculateHarvestDuration(harvestTime) {
	// Parse the harvestTime string into a Date object
	const harvestDate = new Date(harvestTime);

	// Get the current date and time
	const currentDate = new Date();

	// Calculate the time difference in milliseconds
	const timeDifference = currentDate - harvestDate;

	// Calculate the duration in days, hours, and minutes
	const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
	const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

	return `${days} days, ${hours} hours, ${minutes} minutes`;
}


// Endpoint to retrieve Durian data from the smart contract and render index.ejs
router.get('/get-duriandata', async (req, res) => {
	try {
		const farmID = req.query.farmID; // Assuming you pass farmID as a query parameter
		const treeID = req.query.treeID; // Assuming you pass treeID as a query parameter
		const durianID = req.query.durianID; // Assuming you pass durianID as a query parameter

		// Use your contract's ABI to call the getDurianData function
		const result = await contract.methods.getDurianData(farmID, treeID, durianID).call();

		// Parse the result into a JavaScript object
		const durianData = {
			country: result[0],
			postCode: parseInt(result[1]),
			farmID: parseInt(result[2]),
			treeID: parseInt(result[3]),
			durianType: getDurianTypeName(parseInt(result[4])), // Use the mapping function
			durianID: parseInt(result[5]),
			harvestTime: result[6],
			scanTime: result[7],
			firstPlant: result[8],
			workerID: parseInt(result[9]),
		};

		// Calculate the harvest duration
		const harvestDuration = calculateHarvestDuration(durianData.harvestTime);

		// Render the index.ejs file with the retrieved data
		res.render('index', { durianData, harvestDuration });
	} catch (error) {
		logger.error('Error retrieving Durian data from the smart contract:', error); // Log error
		res.status(500).send('Error retrieving Durian data from the smart contract');
	}
});

// Define a route to render the DurianTypes.ejs template
router.get('/DurianTypes', (req, res) => {
	// Render the DurianTypes.ejs template
	res.render('DurianTypes/DurianTypes');
});

router.post('/store-review', async (req, res) => {
	try {
		// Extract data from the request body
		const { farmID, treeID, rating, comment } = req.body;

		// Create a new review document
		const newReview = new Review({
			farmID,
			treeID,
			rating,
			comment,
		});

		// Validate the new review document
		const validationError = newReview.validateSync();

		if (validationError) {
			// If there's a validation error, respond with a bad request status and error message
			res.status(400).send('Validation error: All fields are required.');
		} else {
			// Save the review to the database
			await newReview.save();

			// Respond with a success message
			res.status(200).send('Review stored successfully');
		}
	} catch (error) {
        logger.error('Error storing review:', error);
		res.status(500).send('Error storing review');
	}
});

// Create a route to add reviews from the database to the smart contract
router.get('/add-review-to-contract', async (req, res) => {
	try {
		// Fetch all approved reviews from the database
		const approvedReviews = await ApprovedReview.find({});

		// Loop through the approved reviews and add each to the smart contract
		for (const review of approvedReviews) {
			const { farmID, treeID, rating, comment } = review;

			// Create a transaction object
			const transactionObject = {
				from: account.address,
				to: contractAddress,
				gas: 2000000, // Adjust gas limit as needed
				gasPrice: '10000000000', // Set a high gas price (in wei)
				data: contract.methods
					.addReview(farmID, treeID, rating, comment)
					.encodeABI(),
			};

			// Sign the transaction
			const signedTransaction = await web3.eth.accounts.signTransaction(
				transactionObject,
				privateKey
			);

			// Send the signed transaction
			await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);

			// After a successful transaction, remove the review from the database
			await ApprovedReview.findByIdAndDelete(review._id);
		}

		res.status(200).send('approved reviews added to the smart contract and removed from the database');
	} catch (error) {
		console.error(error);
		res.status(500).send('Error adding approved reviews to the smart contract');
	}
});


// Create a route to get reviews from the smart contract
router.get('/get-reviews', async (req, res) => {
	try {
		const farmID = req.query.farmID; // Assuming you pass farmID as a query parameter
		const treeID = req.query.treeID; // Assuming you pass treeID as a query parameter

		// Use your contract's ABI to call the getReviews function
		const result = await contract.methods.getReviews(farmID, treeID).call();

		// Parse the result into an array of review objects
		const reviews = result.map(item => ({
			rating: parseInt(item[0]),
			comment: item[1],
		}));

		res.status(200).json(reviews);
	} catch (error) {
		console.error(error);
		res.status(500).send('Error retrieving reviews from the smart contract');
	}
});


// In your Express.js server (router.js or a separate route file)
router.get('/durianTree', (req, res) => {
	// Retrieve the farmID and treeID from the request query parameters
	const farmID = req.query.farmID;
	const treeID = req.query.treeID;

	// Render the durianTree.ejs page and pass farmID and treeID as variables
	res.render('durianTree', { farmID, treeID });
});

// In your Express.js server (router.js or a separate route file)
router.get('/reviews', (req, res) => {
	// Retrieve the farmID and treeID from the request query parameters
	const farmID = req.query.farmID;
	const treeID = req.query.treeID;

	// Render the durianTree.ejs page and pass farmID and treeID as variables
	res.render('reviews', { farmID, treeID });
});


// // store every durian data into smart contract every 3 hours
// const job = schedule.scheduleJob('* * */3 * * *', async () => {
// 	logger.info('Starting cronjob...')
// 	try {
// 		const dataFromMongoDB = await DurianData.find(); // Fetch all data from MongoDB

// 		// Loop through the data and send it to the smart contract
// 		for (const data of dataFromMongoDB) {
// 			const {
// 				country,
// 				postCode,
// 				farmID,
// 				treeID,
// 				durianType,
// 				durianID,
// 				harvestTime,
// 				scanTime,
// 				firstPlant,
// 				workerID,
// 			} = data;

// 			// Create a transaction object
// 			const transactionObject = {
// 				from: account.address,
// 				to: contractAddress,
// 				gas: 1000000, // Adjust gas limit as needed
// 				gasPrice,     // Set a high gas price
// 				data: contract.methods
// 					.addDurian(
// 						country,
// 						postCode,
// 						farmID,
// 						treeID,
// 						durianType,
// 						durianID,
// 						harvestTime,
// 						scanTime,
// 						firstPlant,
// 						workerID
// 					)
// 					.encodeABI(),
// 			};

// 			// Sign the transaction
// 			const signedTransaction = await web3.eth.accounts.signTransaction(
// 				transactionObject,
// 				privateKey
// 			);

// 			// Send the signed transaction
// 			await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
// 		}

// 		// After successful transfer, delete data from MongoDB
// 		DurianData.deleteMany({})
// 			.then(() => {
// 				logger.info('All data removed from MongoDB'); // Log success
// 				logger.info('Data transferred to the smart contract and removed from MongoDB');
// 			})
// 			.catch(err => {
// 				logger.error('Error removing data from MongoDB:', err); // Log error
// 				logger.info('Error removing data from MongoDB');
// 			});
// 	} catch (error) {
// 		logger.error('Error transferring data to the smart contract:', error); // Log error
// 		logger.info('Error transferring data to the smart contract');
// 	}
// });

// Define a function to cancel the cron job
function cancelJob() {
	if (cronJob) {
	  cronJob.cancel();
	  logger.info('Cron job canceled');
	} else {
	  logger.info('No cron job running to cancel');
	}
  }

  // Define the route to cancel the cron job
router.get('/cancel-job', (req, res) => {
	cancelJob();
	res.status(200).send('Cron job cancellation requested');
  });

// Define the route to start the cron job
router.get('/start-job', (req, res) => {
	// Schedule the cron job
	cronJob = schedule.scheduleJob('* * */3 * * *', async () => {
	  logger.info('Starting cron job...')
	  try {
		const dataFromMongoDB = await DurianData.find(); // Fetch all data from MongoDB

		// Loop through the data and send it to the smart contract
		for (const data of dataFromMongoDB) {
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
				workerID,
			} = data;

			// Create a transaction object
			const transactionObject = {
				from: account.address,
				to: contractAddress,
				gas: 1000000, // Adjust gas limit as needed
				gasPrice,     // Set a high gas price
				data: contract.methods
					.addDurian(
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
					)
					.encodeABI(),
			};

			// Sign the transaction
			const signedTransaction = await web3.eth.accounts.signTransaction(
				transactionObject,
				privateKey
			);

			// Send the signed transaction
			await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
		}

		// After successful transfer, delete data from MongoDB
		DurianData.deleteMany({})
			.then(() => {
				logger.info('All data removed from MongoDB'); // Log success
				logger.info('Data transferred to the smart contract and removed from MongoDB');
			})
			.catch(err => {
				logger.error('Error removing data from MongoDB:', err); // Log error
				logger.info('Error removing data from MongoDB');
			});
	} catch (error) {
		logger.error('Error transferring data to the smart contract:', error); // Log error
		logger.info('Error transferring data to the smart contract');
	}
	});
	res.status(200).send('Cron job started');
  });
  

module.exports = router;
