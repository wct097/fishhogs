#!/usr/bin/env python3
"""
Simple HTTP server for testing without dependencies
This provides basic endpoints for health checks and testing
"""

import json
import sqlite3
import hashlib
import time
import uuid
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime, timedelta

# Simple in-memory storage for testing
users = {}
sessions = {}
tokens = {}

class FishingTrackerHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urlparse(self.path)
        
        if parsed_path.path == '/':
            self.send_json(200, {
                "status": "ok",
                "version": "0.3.0",
                "endpoints": [
                    "/health",
                    "/api/health",
                    "/auth/test",
                    "/test/db"
                ]
            })
        elif parsed_path.path == '/health':
            self.send_json(200, {
                "status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "services": {
                    "api": "ok",
                    "database": self.check_database()
                }
            })
        elif parsed_path.path == '/api/health':
            self.send_json(200, {
                "status": "ok",
                "backend": "running",
                "database": self.check_database()
            })
        elif parsed_path.path == '/test/db':
            db_status = self.test_database_operations()
            self.send_json(200, db_status)
        else:
            self.send_json(404, {"error": "Not found"})
    
    def do_POST(self):
        parsed_path = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        
        try:
            data = json.loads(post_data) if post_data else {}
        except json.JSONDecodeError:
            self.send_json(400, {"error": "Invalid JSON"})
            return
        
        if parsed_path.path == '/auth/register':
            response = self.handle_register(data)
            self.send_json(response['status'], response['body'])
        elif parsed_path.path == '/auth/login':
            response = self.handle_login(data)
            self.send_json(response['status'], response['body'])
        elif parsed_path.path == '/auth/test':
            # Simple test endpoint
            self.send_json(200, {
                "message": "Auth endpoint working",
                "received": data
            })
        else:
            self.send_json(404, {"error": "Not found"})
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.end_headers()
    
    def send_json(self, status_code, data):
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def check_database(self):
        try:
            conn = sqlite3.connect(':memory:')
            conn.execute('SELECT 1')
            conn.close()
            return "ok"
        except:
            return "error"
    
    def test_database_operations(self):
        try:
            # Create a test database
            conn = sqlite3.connect('test_fishing.db')
            cursor = conn.cursor()
            
            # Create tables
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS test_sessions (
                    id TEXT PRIMARY KEY,
                    started_at INTEGER,
                    title TEXT
                )
            ''')
            
            # Insert test data
            test_id = str(uuid.uuid4())
            cursor.execute(
                'INSERT OR REPLACE INTO test_sessions VALUES (?, ?, ?)',
                (test_id, int(time.time()), 'Test Session')
            )
            
            # Read back
            cursor.execute('SELECT COUNT(*) FROM test_sessions')
            count = cursor.fetchone()[0]
            
            conn.commit()
            conn.close()
            
            return {
                "database": "working",
                "test_insert": "success",
                "record_count": count,
                "test_id": test_id
            }
        except Exception as e:
            return {
                "database": "error",
                "error": str(e)
            }
    
    def handle_register(self, data):
        email = data.get('email', '')
        password = data.get('password', '')
        
        if not email or not password:
            return {
                'status': 400,
                'body': {'error': 'Email and password required'}
            }
        
        if email in users:
            return {
                'status': 400,
                'body': {'error': 'Email already registered'}
            }
        
        # Simple hash for password
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        user_id = str(uuid.uuid4())
        users[email] = {
            'id': user_id,
            'password_hash': password_hash
        }
        
        # Create mock token
        token = str(uuid.uuid4())
        tokens[token] = user_id
        
        return {
            'status': 200,
            'body': {
                'access_token': token,
                'refresh_token': token + '_refresh',
                'token_type': 'bearer'
            }
        }
    
    def handle_login(self, data):
        email = data.get('email', '')
        password = data.get('password', '')
        
        if not email or not password:
            return {
                'status': 400,
                'body': {'error': 'Email and password required'}
            }
        
        password_hash = hashlib.sha256(password.encode()).hexdigest()
        
        if email not in users or users[email]['password_hash'] != password_hash:
            return {
                'status': 401,
                'body': {'error': 'Invalid credentials'}
            }
        
        # Create mock token
        token = str(uuid.uuid4())
        tokens[token] = users[email]['id']
        
        return {
            'status': 200,
            'body': {
                'access_token': token,
                'refresh_token': token + '_refresh',
                'token_type': 'bearer'
            }
        }

def run_server(port=8000):
    server_address = ('', port)
    httpd = HTTPServer(server_address, FishingTrackerHandler)
    print(f"Simple Fishing Tracker Server running on http://localhost:{port}")
    print(f"Health check: http://localhost:{port}/health")
    print(f"API root: http://localhost:{port}/")
    print("Press Ctrl+C to stop")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped")

if __name__ == '__main__':
    run_server()