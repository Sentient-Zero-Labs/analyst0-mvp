#!/bin/bash

while ! docker info > /dev/null 2>&1; do
    echo "Waiting for Docker to be ready..."
    sleep 1
done

cd /Users/pritishna/Documents/analyst0-mvp && docker compose up -d

echo "Server started"

