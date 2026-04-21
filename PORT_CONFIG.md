# Port Configuration

## Development Server Port: 3001

The DentalScan AI application is configured to run on **port 3001** instead of the default port 3000.

---

## Configuration Files

### 1. package.json
```json
"scripts": {
  "dev": "next dev -p 3001",
  "start": "next start -p 3001"
}
```

### 2. .env.local
```
PORT=3001
```

---

## Application URLs

- **Main Scanning Page**: http://localhost:3001
- **Results Page (with Messaging)**: http://localhost:3001/results

---

## API Endpoints

- **Notification API (POST)**: http://localhost:3001/api/notify
- **Notification API (GET)**: http://localhost:3001/api/notify?userId={userId}
- **Messaging API (POST)**: http://localhost:3001/api/messaging
- **Messaging API (GET)**: http://localhost:3001/api/messaging?patientId={patientId}

---

## Testing

### Run the development server:
```bash
npm run dev
```

### Test API endpoints:
```bash
# Test notification creation
curl -X POST http://localhost:3001/api/notify \
  -H "Content-Type: application/json" \
  -d '{"scanId":"test-123","userId":"user-456","status":"completed"}'

# Test notification retrieval
curl http://localhost:3001/api/notify?userId=user-456

# Test messaging
curl -X POST http://localhost:3001/api/messaging \
  -H "Content-Type: application/json" \
  -d '{"patientId":"demo-123","content":"Test message","sender":"patient"}'
```

### Or use the test script:
```bash
bash test-apis.sh
```

---

## Why Port 3001?

Port 3000 may be blocked or already in use on some systems. Port 3001 provides a reliable alternative for development and testing.

---

## Files Updated

All references to port 3000 have been updated to 3001 in:

- ✅ `package.json` (dev and start scripts)
- ✅ `.env.local` (PORT environment variable)
- ✅ `README.md`
- ✅ `SETUP_GUIDE.md`
- ✅ `IMPLEMENTATION.md`
- ✅ `SUBMISSION_CHECKLIST.md`
- ✅ `test-apis.sh`
- ✅ `CHALLENGE_COMPLETE.md` (in parent directory)

---

## Verification

To verify the server is running on the correct port:

1. Start the dev server: `npm run dev`
2. Look for the output: `▲ Next.js 14.2.0 - Local: http://localhost:3001`
3. Open the URL in your browser
