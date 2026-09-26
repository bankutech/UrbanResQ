#!/usr/bin/env bash
# Starts mock SMS / SMTP / Twilio / routing / weather services plus two API instances, runs every test, cleans up.
cd "$(dirname "$0")/.."
node test/mock-services.js & MOCK=$!
PORT=4001 SMTP_URL='smtp://127.0.0.1:4125/?ignoreTLS=true' SMS_WEBHOOK_URL=http://127.0.0.1:4101/sms ROUTING_URL=http://127.0.0.1:4101 WEATHER_URL=http://127.0.0.1:4101 node server.js & API=$!
PORT=4002 TWILIO_ACCOUNT_SID=ACtest TWILIO_AUTH_TOKEN=tok TWILIO_FROM=+15550001111 TWILIO_BASE=http://127.0.0.1:4101 node server.js & API2=$!
sleep 3
API=http://localhost:4001 MOCK_URL=http://127.0.0.1:4101 npm test
CODE=$?
if [ $CODE -eq 0 ]; then API=http://localhost:4002 MOCK_URL=http://127.0.0.1:4101 node test/smoke-twilio.js; CODE=$?; fi
kill $MOCK $API $API2 2>/dev/null
exit $CODE
