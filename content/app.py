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

p = argparse.ArgumentParser(description="Serve & Index Documents")
p.add_argument('reference_path', type=pathlib.Path, help='Path to reference files')

try:
    args = p.parse_args()
    REFERENCE_PATH = args.reference_path
except:
    REFERENCE_PATH = os.getenv('REFERENCE_PATH', None)

if not REFERENCE_PATH:
    REFERENCE_PATH='/app/test-reference/lan'

INDEXER = indexer.Indexer('index', str(REFERENCE_PATH))
INDEXER.index_dir('')

if __name__ == '__main__':
    p.parse_args() # Second call to show help if error
    app.run()