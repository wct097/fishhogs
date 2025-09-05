#!/bin/bash

# Install dependencies
pip install -r requirements.txt

# Run migrations (create tables)
python -c "from app.database import engine, Base; Base.metadata.create_all(bind=engine)"

# Start server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000