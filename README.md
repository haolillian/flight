# Flight Tracker Web App

簡單的 Node.js + Express 範例專案，用來做航班查詢示範。

快速開始

```bash
cd flight-tracker
npm install
npm test      # 會跑 jest 測試
npm start     # 啟動伺服器 -> http://localhost:3000
```

API

- GET /api/flights
  - 支援 query: origin, destination, date (YYYY-MM-DD), flightNumber

前端

- 開啟 `http://localhost:3000` 可在瀏覽器使用搜尋介面

測試

- 測試在 `tests/flights.test.js` 使用 jest + supertest

授權

MIT
