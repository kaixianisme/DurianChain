const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const config = require('../config');
const { web3,contractAddress, abi, contract, privateKey, account, gasPrice} = require('../myweb3');
const schedule = require('node-schedule');

let cronJob;


const { adminLoginLimiter } = require('../middleware/rateLimitMiddleware');
const {cookieJwtAuth} = require('../middleware/adminAuthMiddleware');
const { admin } = require('../middleware/roles');


const { DurianData, Review, ApprovedReview } = require('../db');

// Define your admin-specific routes here
router.get('/', (req, res) => {
	res.render('admin', { errorMessage: req.session.errorMessage });
});

router.post('/login', adminLoginLimiter, async (req, res) => {
	const adminCredential = [{ username: "admin", password: "$2b$15$mwHrBrFfIZCipxeSh9lQPevJ4jzty9GAfJGA0D/Uv/qsKyn8t3uyu", roles: ["admin"] }];
	let user = adminCredential.find(u => u.username === req.body.username);
	const valid = await bcrypt.compare(req.body.password, user.password);


	if (adminCredential.find(u => u.username === req.body.username) && valid == true) {
		const token = jwt.sign({id: user._id, roles: user.roles,}, `${config.AccessToken}`, { expiresIn: "15m" });
		console.log(config.AccessToken);
		res.cookie("token", token, {
			httpOnly: true
		})

		res.redirect('/admin/dashboard')

	}
	else {
		req.session.errorMessage = 'Invalid username or password';
		res.redirect('/admin');
	}
});

// Route to get all reviews from the database and render admin_dashboard.ejs
router.get('/dashboard', authenticateJWT, async (req, res) => {
	try {
		const reviews = await Review.find({}); // Fetch all reviews from MongoDB

		// Render the admin_dashboard.ejs template and pass the reviews to it
		res.render('admin_dashboard', { reviews });
	} catch (error) {
		console.error(error);
		res.status(500).send('Error fetching reviews from MongoDB');
	}
});

// Route to handle approval and store approved reviews
router.post('/approve-review/:reviewId', async (req, res) => {
	try {
		const reviewId = req.params.reviewId;

		// Find the review by ID
		const review = await Review.findById(reviewId);

		if (!review) {
			return res.status(404).send('Review not found');
		}

		// Create a new approved review document
		const approvedReview = new ApprovedReview({
			farmID: review.farmID,
			treeID: review.treeID,
			creaminess: review.creaminess,
			fragment: review.fragment,
			seedSize: review.seedSize,
			taste: review.taste,
			sweetness: review.sweetness,
			bitterness: review.bitterness,
			texture: review.texture,
			aroma: review.aroma,
			comment: review.comment,
			// Copy any other fields you need from the original review
		});

		// Save the approved review
		await approvedReview.save();

		// Delete the review from the original collection
		await Review.findByIdAndDelete(reviewId);

		// Send a response indicating success
		res.status(200).send('Review approved and moved to approved_reviews');
	} catch (error) {
		console.error(error);
		res.status(500).send('Error approving the review');
	}
});

// Endpoint to get the total count of approved reviews
router.get('/approved-review-count', async (req, res) => {
	try {
		// Count the approved reviews in the database
		const approvedReviewCount = await ApprovedReview.countDocuments();
		res.status(200).json({ count: approvedReviewCount });
	} catch (error) {
		console.error(error);
		res.status(500).send('Error counting approved reviews');
	}
});

// Define a function to cancel the cron job
function cancelJob() {
	if (cronJob) {
	  cronJob.cancel();
	  console.log('Cron job canceled');
	} else {
	  console.log('No cron job running to cancel');
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
	console.log('Starting cron job...')
	cronJob = schedule.scheduleJob('* * */3 * * *', async () => {
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
				console.log('All data removed from MongoDB'); // Log success
				console.log('Data transferred to the smart contract and removed from MongoDB');
			})
			.catch(err => {
				console.error('Error removing data from MongoDB:', err); // Log error
				console.log('Error removing data from MongoDB');
			});
	} catch (error) {
		console.error('Error transferring data to the smart contract:', error); // Log error
		console.log('Error transferring data to the smart contract');
	}
	});
	res.status(200).send('Cron job started');
  });

router.get('/logout', (req, res) => {
	res.clearCookie('token');
	res.redirect('/admin'); // Redirect to the login page after logout
});

// Middleware to verify JWT
function authenticateJWT(req, res, next) {
    // Check if a token is in cookies
    const token = req.cookies.token;
  
    if (!token) return res.status(401).render('error', { message: 'Unauthorized' });
  
    jwt.verify(token, `${config.AccessToken}`, (err, user) => {
      if (err) return res.status(403).render('error', { message: 'Forbidden' });
      req.user = user;
      next();
    });
  }

module.exports = router;
