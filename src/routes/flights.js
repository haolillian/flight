const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'flights.json');

function loadFlights() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

// GET /api/flights
// query: origin, destination, date (YYYY-MM-DD), flightNumber
router.get('/', (req, res) => {
  let flights = loadFlights();
  const { origin, destination, date, flightNumber } = req.query;

  if (origin) {
    flights = flights.filter(f => f.origin.toLowerCase() === origin.toLowerCase());
  }
  if (destination) {
    flights = flights.filter(f => f.destination.toLowerCase() === destination.toLowerCase());
  }
  if (date) {
    flights = flights.filter(f => f.date === date);
  }
  if (flightNumber) {
    flights = flights.filter(f => f.flightNumber.toLowerCase() === flightNumber.toLowerCase());
  }

  res.json({ count: flights.length, flights });
});

module.exports = router;
