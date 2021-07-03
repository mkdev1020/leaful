#!/bin/bash
docker-compose down && docker-compose build --no-cache && docker-compose up -d
echo "waiting to warm up..."
sleep 20
echo "flushing db changes"
npm run flush-db-changes
