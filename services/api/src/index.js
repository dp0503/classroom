require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

// API routes
app.use('/api', require('./routes'));

const port = process.env.PORT || 4000;
if (require.main === module) {
	app.listen(port, () => {
		console.log(`API listening on http://localhost:${port}`);
	});
}

module.exports = { app };


