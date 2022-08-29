#!/bin/bash 

python /code/app/main.py --reference_path "$REFERENCE_PATH" --index_path "$INDEX_PATH"

uvicorn app.main:app --host 0.0.0.0 --port 5000