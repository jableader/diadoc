from flask import Flask, request, send_from_directory

app = Flask(__name__)

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('static/js', path)

@app.route('/css/<path:path>')
def send_css(path):
    return send_from_directory('static/css', path)

@app.route('/img/<path:path>')
def send_img(path):
    return send_from_directory('static/img', path)

@app.route("/")
def hello_world():
    with open('index.html', 'r') as fin:
        return fin.read()

if __name__ == '__main__':
    app.run()