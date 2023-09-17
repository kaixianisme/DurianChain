const express = require('express');
const router = express.Router();

const { adminLoginLimiter } = require('../middleware/rateLimitMiddleware');
const { isAdminAuthenticated } = require('../middleware/adminAuthMiddleware');

const { DurianData, Review, ApprovedReview } = require('../db');

// Define your admin-specific routes here
router.get('/', (req, res) => {
	res.render('admin', { errorMessage: req.session.errorMessage });
});

router.post('/login', adminLoginLimiter, (req, res) => {
	const username = req.body.username;
	const password = req.body.password;

	if (username === 'admin' && password === '123') {
		req.session.isAdmin = true;
		res.redirect('/admin/dashboard'); // Redirect to the admin dashboard
	} else {
		req.session.isAdmin = false; // Set isAdmin to false for non-admin users (optional)
		req.session.errorMessage = 'Invalid username or password';
		res.redirect('/admin'); // Redirect back to the login page with an error message
	}
});

// Route to get all reviews from the database and render admin_dashboard.ejs
router.get('/dashboard', isAdminAuthenticated, async (req, res) => {
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
router.post('/approve-review/:reviewId', isAdminAuthenticated, async (req, res) => {
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
			rating: review.rating,
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
router.get('/approved-review-count', isAdminAuthenticated, async (req, res) => {
	try {
		// Count the approved reviews in the database
		const approvedReviewCount = await ApprovedReview.countDocuments();
		res.status(200).json({ count: approvedReviewCount });
	} catch (error) {
		console.error(error);
		res.status(500).send('Error counting approved reviews');
	}
});

router.get('/logout', (req, res) => {
	req.session.isAdmin = false;
	res.redirect('/admin'); // Redirect to the login page after logout
});

module.exports = router;
