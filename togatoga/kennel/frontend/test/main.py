from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import os.path
import glob
import re
import sys

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
            i = int(self.path[14:])
            self.send_response(200)
            self.send_header('Content-type','application/json')
            self.end_headers()
            with open(f'./json/{i}.json') as f:
                result_json = json.load(f)
                self.wfile.write(json.dumps(result_json).encode('UTF-8'))
        elif re.search('^/api/problems/\d*/solutions', self.path) is not None:
            m = re.search('^/api/problems/(\d*)/solutions', self.path)
            i = int(m.groups()[0])
            self.send_response(200)
            self.send_header('Content-type','application/json')
            self.end_headers()
            with open(f'./json/solutions_{i}.json') as f:
                result_json = json.load(f)
                self.wfile.write(json.dumps(result_json).encode('UTF-8'))
        elif self.path == '/api/minimal':
            self.send_response(200)
            self.send_header('Content-type','application/json')
            self.end_headers()
            result_json = [
                {
                    "problem_id": 1,
                    "minimal_dislike": 624,
                    "created_at": "2021-07-10T21:24:24.834583Z"
                },
                {
                    "problem_id": 2,
                    "minimal_dislike": 193,
                    "created_at": "2021-07-10T22:24:13.281485Z"
                }
            ]
            self.wfile.write(json.dumps(result_json).encode('UTF-8'))

    def do_POST(self):
        if re.search('^/api/problems/(\d*)/solutions/(.*)', self.path) is not None:
            self.log_error("submit")
            m = re.search('^/api/problems/(\d*)/solutions/(.*)', self.path)
            problemid = int(m.groups()[0])
            user = m.groups()[1]
            content_length = int(self.headers['content-length'])
            s = self.rfile.read(content_length).decode('utf-8')
            self.log_error(s)
            self.log_error("=" * 20)
            self.log_error(f"user: {user}")
            self.log_error(f"problem: {problemid}")
            self.send_response_only(200)
            self.wfile.write("OK".encode('UTF-8'))

PORT = 8080

httpd = HTTPServer(("", PORT), Handler)
httpd.serve_forever()