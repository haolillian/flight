const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const dataPath = path.join(__dirname, '..', 'data', 'flights.json');

function loadFlights() {
  const raw = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(raw);
}

// small helper: try to get a fetch function (Node 18+ has global fetch)
let fetchFn;
try {
  fetchFn = global.fetch || require('node-fetch');
} catch (e) {
  fetchFn = null;
}

async function fetchAviationStack({ origin, destination, date, flightNumber }) {
  const key = process.env.AVIATIONSTACK_API_KEY;
  if (!key) throw new Error('no aviationstack key');
  if (!fetchFn) throw new Error('fetch not available');

  const params = new URLSearchParams();
  params.append('access_key', key);
  if (origin) params.append('dep_iata', origin);
  if (destination) params.append('arr_iata', destination);
  if (date) params.append('flight_date', date);
  // Note: aviationstack may allow flight_number filtering differently; we'll filter client-side too

  const url = `http://api.aviationstack.com/v1/flights?${params.toString()}`;
  const resp = await fetchFn(url);
  if (!resp.ok) throw new Error(`aviationstack status ${resp.status}`);
  const body = await resp.json();
  if (!body || !body.data) return [];

  // map to our internal flight shape
  const mapped = body.data.map(item => {
    // item.flight might contain number/code; departure/arrival have times
    const flightNumberVal = (item.flight && (item.flight.number || item.flight.iata || item.flight.icao)) || '';
    const dep = item.departure || {};
    const arr = item.arrival || {};
    return {
      id: item.flight && item.flight.iata ? `${item.flight.iata}-${dep.scheduled || ''}` : (item.flight && item.flight.number) || item.flight_iata || item.flight_icao || (item.flight && item.flight.number) || Math.random().toString(36).slice(2,8),
      airline: (item.airline && item.airline.name) || item.airline_iata || 'Unknown',
      flightNumber: flightNumberVal,
      origin: (dep.iata || dep.airport || origin || '').toUpperCase(),
      destination: (arr.iata || arr.airport || destination || '').toUpperCase(),
      departure: dep.scheduled || dep.estimated || dep.actual || null,
      arrival: arr.scheduled || arr.estimated || arr.actual || null,
      date: date || (dep.scheduled ? dep.scheduled.split('T')[0] : ''),
      status: item.flight_status || item.status || 'Unknown',
      price: null
    };
  });

  // optional client-side flightNumber exact match
  if (flightNumber) {
    return mapped.filter(f => (f.flightNumber || '').toLowerCase() === flightNumber.toLowerCase());
  }
  return mapped;
}

// GET /api/flights
// query: origin, destination, date (YYYY-MM-DD), flightNumber
router.get('/', async (req, res) => {
  const { origin, destination, date, flightNumber } = req.query;

  const provider = process.env.FLIGHT_PROVIDER || process.env.REAL_FLIGHT_PROVIDER || '';

  // If a provider is configured, attempt to query it. Currently supports 'aviationstack'.
  if (provider && provider.toLowerCase() === 'aviationstack' && process.env.AVIATIONSTACK_API_KEY) {
    try {
      const flights = await fetchAviationStack({ origin, destination, date, flightNumber });
      return res.json({ count: flights.length, flights });
    } catch (err) {
      // fall back to local data if provider call fails
      console.error('AviationStack fetch failed:', err.message || err);
    }
  }

  // fallback: static local data
  let flights = loadFlights();

  if (origin) {
    flights = flights.filter(f => (f.origin || '').toLowerCase() === origin.toLowerCase());
  }
  if (destination) {
    flights = flights.filter(f => (f.destination || '').toLowerCase() === destination.toLowerCase());
  }
  if (date) {
    flights = flights.filter(f => f.date === date);
  }
  if (flightNumber) {
    flights = flights.filter(f => (f.flightNumber || '').toLowerCase() === flightNumber.toLowerCase());
  }

  res.json({ count: flights.length, flights });
});

module.exports = router;
