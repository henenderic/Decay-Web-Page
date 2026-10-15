#!/usr/bin/env python3
"""Local-only interactive decay-frame viewer. No external web dependencies."""
from __future__ import annotations

import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
from urllib.parse import urlsplit

from interactive_data import build_payload, normalize_event, parse_json
from kinematics import InputError

HERE = Path(__file__).resolve().parent
MAX_BODY = 131072
ASSETS = {'/':('index.html','text/html; charset=utf-8'),
          '/app.js':('app.js','text/javascript; charset=utf-8'),
          '/drawing.js':('drawing.js','text/javascript; charset=utf-8'),
          '/common.js':('common.js','text/javascript; charset=utf-8'),
          '/transport.js':('transport.js','text/javascript; charset=utf-8'),
          '/legend.js':('legend.js','text/javascript; charset=utf-8'),
          '/nextstep.js':('nextstep.js','text/javascript; charset=utf-8'),
          '/greenwich.js':('greenwich.js','text/javascript; charset=utf-8'),
          '/world.js':('world.js','text/javascript; charset=utf-8'),
          '/decay_form.js':('decay_form.js','text/javascript; charset=utf-8'),
          '/euler.js':('euler.js','text/javascript; charset=utf-8'),
          '/sketch.js':('sketch.js','text/javascript; charset=utf-8'),
          '/amplitude.js':('amplitude.js','text/javascript; charset=utf-8'),
          '/style.css':('style.css','text/css; charset=utf-8')}


class Handler(BaseHTTPRequestHandler):
    def send_bytes(self, status, body, content_type):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control','no-store')
        self.send_header('X-Content-Type-Options','nosniff')
        self.send_header('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'")
        self.end_headers()
        self.wfile.write(body)

    def json(self, status, data):
        self.send_bytes(status,json.dumps(data,ensure_ascii=False,allow_nan=False).encode(), 'application/json; charset=utf-8')

    def allowed(self):
        port = self.server.server_port
        hosts = {f'127.0.0.1:{port}',f'localhost:{port}'}
        if self.headers.get('Host') not in hosts:
            self.json(403,{'error':'Only local access is permitted.'})
            return False
        origin = self.headers.get('Origin')
        if origin and origin not in {'http://'+host for host in hosts}:
            self.json(403,{'error':'The request must originate from the local interface.'})
            return False
        return True

    def do_GET(self):
        if not self.allowed():
            return
        path = urlsplit(self.path).path
        if path == '/api/config':
            self.json(200,{'initial_event':self.server.initial_event})
        elif path in ASSETS:
            name, mime = ASSETS[path]
            self.send_bytes(200,(HERE/'interactive_web'/name).read_bytes(),mime)
        else:
            self.json(404,{'error':'Not found.'})

    def do_POST(self):
        if not self.allowed():
            return
        if urlsplit(self.path).path != '/api/compute':
            self.json(404,{'error':'Not found.'})
            return
        try:
            length = int(self.headers.get('Content-Length','0'))
            if not 0 < length <= MAX_BODY:
                self.json(413,{'error':'The input must be between 1 and 131072 bytes.'})
                return
            if self.headers.get_content_type() != 'application/json':
                self.json(415,{'error':'A JSON event is required.'})
                return
            event = parse_json(self.rfile.read(length).decode('utf-8'))
            self.json(200,build_payload(event))
        except (InputError,ValueError,TypeError,OverflowError,RecursionError,UnicodeError) as exc:
            self.json(422,{'error':str(exc) if not isinstance(exc,RecursionError) else 'The topology is nested too deeply.'})

    def log_message(self, format, *args):
        # Avoid logging scientific inputs; only the ordinary method/path/status.
        super().log_message(format,*args)


def make_server(port=8765, initial_event=None):
    server = ThreadingHTTPServer(('127.0.0.1',port),Handler)
    server.daemon_threads = True
    server.initial_event = normalize_event(initial_event) if initial_event else None      # without it the page starts with random momenta
    return server


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port',type=int,default=8765)
    parser.add_argument('--event',type=Path,help='Optional initial event JSON; otherwise the page starts with random momenta of a decay into three particles.')
    args = parser.parse_args()
    try:
        event = parse_json(args.event.read_text()) if args.event else None
        server = make_server(args.port,event)
    except (OSError,InputError,ValueError) as exc:
        parser.exit(2,str(exc)+'\n')
    print(f'Interactive viewer: http://127.0.0.1:{server.server_port}/',flush=True)
    print('Stop with Ctrl+C. Inputs are processed in memory only.',flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
