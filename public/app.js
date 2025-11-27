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
