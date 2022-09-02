#!/bin/bash 

if [[ -z "$(ls "$INDEX_PATH" 2> /dev/null)" ]]; then
  python /code/app/main.py --reference_path "$REFERENCE_PATH" --index_path "$INDEX_PATH" &
fi

uvicorn app.main:app --host 0.0.0.0 --port 5000