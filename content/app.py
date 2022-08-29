import argparse
import pathlib
import indexer
import os

from flask_cors import CORS
from flask import Flask, request, send_from_directory
app = Flask(__name__)
CORS(app)
cors = CORS(app, resource={
    r"/*":{
        "origins":"*"
    }
})

REFERENCE_PATH='/dev/null'
INDEXER = None

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/reference/<path:path>')
def fetch_resource(path):
    global REFERENCE_PATH
    return send_from_directory(REFERENCE_PATH, path)

@app.route('/search')
def search():
    global INDEXER
    if 'query' not in request.args:
        return "Missing query param", 400

    query = request.args.get('query')
    return INDEXER.search(query)

@app.route('/lexicon')
def lexicon():
    global INDEXER

    return INDEXER.lexicon()

REFERENCE_PATH = os.getenv('REFERENCE_PATH', './test-reference/lan')
INDEX_PATH = os.getenv('INDEX_PATH', '/tmp/diadoc-index')
INDEXER = None

if __name__ == '__main__':
    p = argparse.ArgumentParser(description="Serve & Index Documents")
    p.add_argument('--reference_path', default=REFERENCE_PATH, help='Path to reference files')
    p.add_argument('--index_path', default=INDEX_PATH, help='Path to index')
    p.add_argument('--create_index', '-c', action='store_true', help="Create index if it doesn't exist")
    p.add_argument('--run', '-r', action='store_true', help='Run web service')

    args = p.parse_args()
    REFERENCE_PATH = args.reference_path
    INDEX_PATH = args.index_path

    INDEXER = indexer.Indexer(INDEX_PATH, REFERENCE_PATH, create=args.create_index)
    if args.create_index:
        INDEXER.index_dir('')
    
    if args.run:
        app.run(host='0.0.0.0', debug=True, port=5000)
else:
    INDEXER = indexer.Indexer('index', REFERENCE_PATH)
    INDEXER.index_dir('')