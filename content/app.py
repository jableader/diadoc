import argparse
import pathlib

from flask import Flask, send_from_directory
app = Flask(__name__)

REFERENCE_PATH='/dev/null'

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/reference/<path:path>')
def fetch_resource(path):
    global REFERENCE_PATH
    return send_from_directory(REFERENCE_PATH, path)

@app.route('/search')
def search(prompt):
    pass

if __name__ == '__main__':
    p = argparse.ArgumentParser(description="Serve & Index Documents")
    p.add_argument('reference_path', type=pathlib.Path, help='Path to reference files')
    
    args = p.parse_args()
    REFERENCE_PATH = pathlib.Path('reference') / args.reference_path

    app.run()