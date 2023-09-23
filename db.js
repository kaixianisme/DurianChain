const config = require('./config');
const mongoose = require('mongoose');
const mongoURI = config.mongoURI;

// Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => console.log('MongoDB connected'))
	.catch(err => console.error(err));

// Define a MongoDB schema for durians
const durianSchema = new mongoose.Schema({
	country: String,
	postCode: Number,
	farmID: Number,
	treeID: Number,
	durianType: Number,
	durianID: Number,
	harvestTime: String,
	scanTime: String,
	firstPlant: String,
	workerID: Number
});

// Define a MongoDB schema for reviews, including additional categories
const reviewSchema = new mongoose.Schema({
	farmID: {
		type: Number,
		required: true,
	},
	treeID: {
		type: Number,
		required: true,
	},
	creaminess: {
		type: Number,
		required: true,
	},
	fragment: {
		type: Number,
		required: true,
	},
	seedSize: {
		type: Number,
		required: true,
	},
	taste: {
		type: Number,
		required: true,
	},
	sweetness: {
		type: Number,
		required: true,
	},
	bitterness: {
		type: Number,
		required: true,
	},
	texture: {
		type: Number,
		required: true,
	},
	aroma: {
		type: Number,
		required: true,
	},
	comment: {
		type: String,
		required: true,
	},
});

// Define a schema and model for approved reviews (if not already defined)
const approvedReviewSchema = new mongoose.Schema({
	farmID: Number,
	treeID: Number,
	rating: Number,
	comment: String,
});

// Create and export models based on the schemas
const DurianData = mongoose.model('duriandata', durianSchema);
const Review = mongoose.model('Review', reviewSchema);
const ApprovedReview = mongoose.model('ApprovedReview', approvedReviewSchema);

module.exports = { DurianData, Review, ApprovedReview };
