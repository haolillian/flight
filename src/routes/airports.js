const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'airports.json');

function loadAirports() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

// GET /api/airports?q=keyword
// Returns a small list of matching airports (by code, name or city)
router.get('/', (req, res) => {
  const q = (req.query.q || '').trim().toLowerCase();
  let airports = loadAirports();

  if (q) {
    airports = airports.filter(a => {
      return (
        a.code.toLowerCase().includes(q) ||
        (a.name && a.name.toLowerCase().includes(q)) ||
        (a.city && a.city.toLowerCase().includes(q))
      );
    });
  }

  // limit results to 10
  res.json(airports.slice(0, 10));
});

module.exports = router;
