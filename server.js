const express = require('express');
const config = require('./config');
const bodyParser = require('body-parser');
const app = express();
const port = config.PORT; // Set your desired port

require('winston-mongodb')

const logger = require('./logger')

// Express middleware to serve static files from the 'public' folder
app.use(express.static('views/DurianTypes'));

// Set the view engine to EJS
app.set('view engine', 'ejs'); // Add this line
const session = require('express-session');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: config.secretKey, resave: true, saveUninitialized: true }));

app.use(bodyParser.json());

const userRoutes = require('./routes/user_routes');
// Use the user routes
app.use('/', userRoutes);

const adminRoutes = require('./routes/admin_routes');
// Use the user routes
app.use('/admin', adminRoutes);

app.get("*", (req, res) => {
	res.status(404).render('404.ejs');
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    // Perform any necessary cleanup or exit the application
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Promise Rejection:', reason);
    // Perform any necessary cleanup or exit the application
});

app.listen(port, () => {
	logger.info(`Server is running on port ${port}`);
});