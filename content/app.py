import argparse
import pathlib
import indexer

from flask import Flask, request, send_from_directory
app = Flask(__name__)

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
    if 'prompt' not in request.args:
        return "Missing prompt param", 400

    prompt = request.args.get('prompt')
    return INDEXER.search(prompt)

if __name__ == '__main__':
    p = argparse.ArgumentParser(description="Serve & Index Documents")
    p.add_argument('reference_path', type=pathlib.Path, help='Path to reference files')
    
    args = p.parse_args()
    REFERENCE_PATH = pathlib.Path('reference') / args.reference_path
    INDEXER = indexer.Indexer('index', str(REFERENCE_PATH))
    INDEXER.index_dir('')

    app.run()