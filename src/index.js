const express = require('express');
const path = require('path');
const cors = require('cors');

const flightsRouter = require('./routes/flights');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/flights', flightsRouter);

// Serve static frontend
app.use(express.static(path.join(__dirname, '..', 'public')));

// Fallback to index.html for SPA-like behaviour
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Flight Tracker running on http://localhost:${PORT}`);
  });
}

module.exports = app;
