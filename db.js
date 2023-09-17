const config = require('./config');
const mongoose = require('mongoose');
const mongoURI = config.mongoURI;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('MongoDB connected'))
	.catch(err => console.error(err));

// Define a MongoDB schema
const durianSchema = new mongoose.Schema({
	country: String,
	postCode: Number,
	farmID: Number,
	treeID: Number,
	durianType: Number,
	durianID: Number,
	harvestTime: String,
	workerID: Number
});

const reviewSchema = new mongoose.Schema({
	farmID: {
		type: Number,
		required: true, // Make the farmID field required
	},
	treeID: {
		type: Number,
		required: true, // Make the treeID field required
	},
	rating: {
		type: Number,
		required: true, // Make the rating field required
	},
	comment: {
		type: String,
		required: true, // Make the comment field required
	},
});

// Define a schema and model for approved reviews (if not already defined)
const approvedReviewSchema = new mongoose.Schema({
	farmID: Number,
	treeID: Number,
	rating: Number,
	comment: String,
	// Add any other fields you need for approved reviews
});

// Create and export models based on the schemas
const DurianData = mongoose.model('duriandata', durianSchema);
const Review = mongoose.model('Review', reviewSchema);
const ApprovedReview = mongoose.model('ApprovedReview', approvedReviewSchema);

module.exports = { DurianData, Review, ApprovedReview };
