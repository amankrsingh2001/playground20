#!/bin/bash

# Load environment variables from .env if it exists
if [ -f packages/db/.env ]; then
  export $(cat packages/db/.env | grep -v '^#' | xargs)
fi

# Check for known cloud providers (e.g., neon.tech, supabase.co, render.com, etc.)
if [[ "$DATABASE_URL" == *"neon.tech"* || "$DATABASE_URL" == *"supabase.co"* || "$DATABASE_URL" == *"render.com"* ]]; then
  echo "🟢 Detected cloud database — skipping Docker setup."
else
  echo "🟡 Using local database — starting Docker..."
  pnpm docker:up
fi

# Start TurboRepo dev
pnpm turbo run dev