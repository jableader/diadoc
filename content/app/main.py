try:
    import indexer
except ModuleNotFoundError:
    from app import indexer

import argparse
import pathlib
import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

app = FastAPI()

REFERENCE_PATH = os.getenv('REFERENCE_PATH', '../test-reference/lan')
INDEX_PATH = os.getenv('INDEX_PATH', '/tmp/diadoc-index')

def get_indexer():
    return indexer.Indexer(INDEX_PATH, REFERENCE_PATH)

@app.get('/')
def hello_world():
    return {"status": "running"}

@app.get('/search')
def search(query):
    return get_indexer().search(query)

@app.get('/lexicon')
def lexicon():
    return get_indexer().lexicon()

if __name__ == '__main__':
    import argparse

    p = argparse.ArgumentParser(description="Serve & Index Documents")
    p.add_argument('--reference_path', default=REFERENCE_PATH, help='Path to reference files')
    p.add_argument('--index_path', default=INDEX_PATH, help='Path to index')

    args = p.parse_args()
    
    idx = indexer.Indexer(args.index_path, args.reference_path, create=True)

    print("Indexing directory %s" % args.reference_path)
    idx.index_dir('')