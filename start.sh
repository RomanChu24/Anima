#!/bin/sh
set -e
npm run build
exec npx next start -p 80
