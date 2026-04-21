#!/bin/bash

# DentalScan AI - API Testing Script
# This script tests all implemented API endpoints

echo "🧪 DentalScan AI - API Testing Script"
echo "======================================"
echo ""

BASE_URL="http://localhost:3001"

echo "📍 Testing Notification API..."
echo ""

# Test 1: Create a notification
echo "1️⃣  Creating notification..."
curl -X POST "$BASE_URL/api/notify" \
  -H "Content-Type: application/json" \
  -d '{
    "scanId": "test-scan-123",
    "userId": "user-456",
    "status": "completed"
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 2: Get notifications
echo "2️⃣  Retrieving notifications..."
curl "$BASE_URL/api/notify?userId=user-456" \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "📬 Testing Messaging API..."
echo ""

# Test 3: Send a message (creates thread)
echo "3️⃣  Sending first message (creates thread)..."
curl -X POST "$BASE_URL/api/messaging" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-demo-123",
    "content": "Hi, I have a question about my scan results.",
    "sender": "patient"
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 4: Send another message
echo "4️⃣  Sending second message..."
curl -X POST "$BASE_URL/api/messaging" \
  -H "Content-Type: application/json" \
  -d '{
    "patientId": "patient-demo-123",
    "content": "Our team will review your results shortly.",
    "sender": "dentist"
  }' \
  -w "\nStatus: %{http_code}\n\n"

# Test 5: Get messages
echo "5️⃣  Retrieving message thread..."
curl "$BASE_URL/api/messaging?patientId=patient-demo-123" \
  -w "\nStatus: %{http_code}\n\n"

echo ""
echo "✅ Testing complete!"
echo ""
echo "💡 Next steps:"
echo "  - Open http://localhost:3001 to test the scanning flow"
echo "  - Open http://localhost:3001/results to test the messaging UI"
echo "  - Run 'npx prisma studio' to view the database"
