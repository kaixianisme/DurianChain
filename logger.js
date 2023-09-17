const { createLogger, format, transports } = require("winston");
const config = require('./config');
const mongoURI = config.mongoURI;

const logger = createLogger({
    transports: [
		new transports.Console(),
		new transports.File({
			level: 'warn',
			filename: 'logsWarnings.log'
		}),
		new transports.File({
			level: 'error',
			filename: 'logsErrors.log'
		}),
		new transports.MongoDB({
			db: mongoURI,
			collection: 'logs'
		})
	],
	format: format.combine(
		format.json(),
		format.timestamp(),
		format.metadata(),
		format.prettyPrint()
	),
})

module.exports = logger