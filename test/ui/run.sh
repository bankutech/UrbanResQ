#!/usr/bin/env bash
# Simulated-browser (jsdom) click-through of every page. Needs the server running on :4000 and a freshly initialised database.
cd "$(dirname "$0")/../.."
npx esbuild public/js/app.js --bundle --format=iife --outfile=test/ui/bundle.js --log-level=warning || exit 1
for t in ui ui2 ui3 xss; do
  echo "== $t"; node test/ui/$t.test.js || exit 1
done
