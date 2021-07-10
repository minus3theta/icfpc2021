from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os.path
import glob
import re

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.send_response(200)
            self.send_header('Content-Type', 'text/html')
            self.end_headers()
            with open('../dist/index.html') as f:
                self.wfile.write(f.read().encode('UTF-8'))
        elif self.path == '/index.js':
            self.send_response(200)
            self.send_header('Content-Type', 'text/javascript')
            self.end_headers()
            with open('../dist/index.js') as f:
                self.wfile.write(f.read().encode('UTF-8'))
        elif re.search('^/api/problems/\d*$', self.path) is not None:
            self.send_response(200)
            self.send_header('Content-type','application/json')
            self.end_headers()
            with open('./json/1.json') as f:
                result_json = json.load(f)
                self.wfile.write(json.dumps(result_json).encode('UTF-8'))

    def do_POST(self):
        service_names = []
        files = glob.glob('./*.json')
        for file in files:
            basename = os.path.basename(file)
            service_names.append(os.path.splitext(basename)[0])

        for name in service_names:
            if self.path == ('/' + name):
                self.do_json_service(name)

    def do_json_service(self, name):
        f = open(name + ".json")
        result_json = json.load(f)
        f.close()

        self.send_response(200)
        self.send_header('Content-type','application/json')
        self.end_headers()
        self.wfile.write(json.dumps(result_json).encode('UTF-8'))

PORT = 8080

httpd = HTTPServer(("", PORT), Handler)
httpd.serve_forever()