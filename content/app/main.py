try:
    import indexer
except ModuleNotFoundError:
    from app import indexer

import argparse
import os
import sys

REFERENCE_PATH = os.getenv('REFERENCE_PATH', '../test-reference/lan')
INDEX_PATH = os.getenv('INDEX_PATH', '/tmp/diadoc-index')

if __name__ == '__main__':
    import argparse

    p = argparse.ArgumentParser(description="Serve & Index Documents")
    p.add_argument('--reference_path', default=REFERENCE_PATH, help='Path to reference files')
    p.add_argument('--index_path', default=INDEX_PATH, help='Path to index')

    args = p.parse_args()
    
    idx = indexer.Indexer(args.index_path, args.reference_path, create=True)

    print("Indexing directory %s" % args.reference_path)
    idx.index_dir('')
    print("Finished indexing")
    sys.exit(0)

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/ref", StaticFiles(directory=REFERENCE_PATH), name="reference")

def get_indexer():
    return indexer.Indexer(INDEX_PATH, REFERENCE_PATH)

@app.get('/api/status')
async def hello_world():
    return {"status": "running"}

@app.get('/api/search')
async def search(query):
    return get_indexer().search(query)

@app.get('/api/lexicon')
async def lexicon():
    return get_indexer().lexicon()


    