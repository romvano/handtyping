import json, os
from datetime import datetime

from flask import Flask, render_template, request, jsonify
import csv

app = Flask(__name__)

@app.route('/')
def main():
    return render_template('index.html')

@app.route('/data/', methods=['POST'])
def data():
    bdata = request.data
    if not bdata:
        return jsonify(), 400
    bdata = bdata.decode('utf-8')
    parsed_data = json.loads(bdata)
    data, name, text = parsed_data.get('data'), parsed_data.get('name').get('value'), parsed_data.get('text')
    if not data or not name or not text:
        return jsonify(), 400
    data.sort(key=lambda x: x['timestamp'])
    print(os.getcwd())
    filename = 'static/data/' + datetime.now().isoformat()
    with open(filename+'_raw.txt', 'w') as f:
        f.write(bdata)
    with open(filename+'_text.txt', 'w') as f:
        f.write(name + '\n' + text)

    data.sort(key=lambda x: [x['press'] == 'down', x['timestamp']])
    up, down = data[:len(data)//2], data[len(data)//2:]
    up_data = []
    for i in range(len(data)//2-1, 0, -1):
        up_data.append({
            'up': up[i-1]['key'],
            'down': down[i]['key'],
            'timedelta': down[i]['timestamp'] - up[i-1]['timestamp']
        })

    data.sort(key=lambda x: [x['key'], x['timestamp']])
    down_data = []
    for i in range(len(data)-1, 0, -2):
        el = {}
        el['key'] = data[i]['key']
        el['timedelta'] = data[i]['timestamp'] - data[i-1]['timestamp']
        down_data.append(el)

    print(down_data)
    print(up_data)

    with open(filename+'_down.csv', 'w+') as f:
        csvwriter = csv.DictWriter(f, down_data[0].keys())
        csvwriter.writeheader()
        csvwriter.writerows(down_data)

    with open(filename+'_up.csv', 'w+') as f:
        csvwriter = csv.DictWriter(f, up_data[0].keys())
        csvwriter.writeheader()
        csvwriter.writerows(up_data)
    return jsonify({'down': filename+'_down.csv', 'up': filename+'_up.csv'})

if __name__ == '__main__':
    app.run()
