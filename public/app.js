document.getElementById('searchBtn').addEventListener('click', async () => {
  const origin = document.getElementById('origin').value.trim();
  const destination = document.getElementById('destination').value.trim();
  const date = document.getElementById('date').value;
  const flightNumber = document.getElementById('flightNumber').value.trim();

  const params = new URLSearchParams();
  if (origin) params.append('origin', origin);
  if (destination) params.append('destination', destination);
  if (date) params.append('date', date);
  if (flightNumber) params.append('flightNumber', flightNumber);

  const res = await fetch('/api/flights?' + params.toString());
  const data = await res.json();

  const container = document.getElementById('results');
  if (!data || data.count === 0) {
    container.innerHTML = '<p>No flights found.</p>';
    return;
  }

  const rows = data.flights.map(f => `
    <tr>
      <td>${f.airline}</td>
      <td>${f.flightNumber}</td>
      <td>${f.origin}</td>
      <td>${f.destination}</td>
      <td>${new Date(f.departure).toLocaleString()}</td>
      <td>${new Date(f.arrival).toLocaleString()}</td>
      <td>${f.date}</td>
      <td>${f.status}</td>
      <td>$${f.price}</td>
    </tr>
  `).join('');

  container.innerHTML = `
    <p>Found ${data.count} result(s)</p>
    <table>
      <thead>
        <tr>
          <th>Airline</th><th>Flight#</th><th>Origin</th><th>Destination</th><th>Departure</th><th>Arrival</th><th>Date</th><th>Status</th><th>Price</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
});

// --- Autocomplete for origin/destination inputs ---
function createSuggestionBox(input) {
  const box = document.createElement('div');
  box.style.position = 'absolute';
  box.style.background = '#fff';
  box.style.border = '1px solid #ddd';
  box.style.maxHeight = '200px';
  box.style.overflow = 'auto';
  box.style.zIndex = 1000;
  box.style.minWidth = (input.offsetWidth || 200) + 'px';
  box.className = 'suggestion-box';
  input.parentNode.style.position = 'relative';
  input.parentNode.appendChild(box);
  return box;
}

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

async function fetchAirports(q) {
  const res = await fetch('/api/airports?q=' + encodeURIComponent(q));
  if (!res.ok) return [];
  return res.json();
}

function attachAutocomplete(inputId) {
  const input = document.getElementById(inputId);
  const box = createSuggestionBox(input);

  const render = (list) => {
    box.innerHTML = '';
    if (!list || list.length === 0) {
      box.style.display = 'none';
      return;
    }
    list.forEach(a => {
      const el = document.createElement('div');
      el.style.padding = '6px 8px';
      el.style.cursor = 'pointer';
      el.textContent = `${a.city} — ${a.name} (${a.code})`;
      el.addEventListener('click', () => {
        // fill input with IATA code for search
        input.value = a.code;
        box.style.display = 'none';
      });
      box.appendChild(el);
    });
    box.style.display = 'block';
  };

  const onInput = debounce(async () => {
    const q = input.value.trim();
    if (!q) { render([]); return; }
    const list = await fetchAirports(q);
    render(list);
  }, 250);

  input.addEventListener('input', onInput);
  document.addEventListener('click', (e) => {
    if (!box.contains(e.target) && e.target !== input) box.style.display = 'none';
  });
}

attachAutocomplete('origin');
attachAutocomplete('destination');
