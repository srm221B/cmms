#!/usr/bin/env python3
"""
Ultra-simple Railway test - no configuration files
"""
import os

def application(environ, start_response):
    """Simple WSGI application for Railway"""
    status = '200 OK'
    headers = [('Content-type', 'text/html')]
    start_response(status, headers)
    
    html = """
    <!DOCTYPE html>
    <html>
    <head><title>CMMS Railway Test</title></head>
    <body style="font-family: Arial; padding: 40px; background: linear-gradient(45deg, #667eea, #764ba2); color: white; text-align: center;">
        <h1>🏭 CMMS Application</h1>
        <h2>✅ Railway Deployment Working!</h2>
        <p>Your CMMS application is now successfully running on Railway.</p>
        <p>Port: {}</p>
        <p>Environment: Production</p>
    </body>
    </html>
    """.format(os.environ.get('PORT', '8000'))
    
    return [html.encode('utf-8')]

if __name__ == "__main__":
    from wsgiref.simple_server import make_server
    port = int(os.environ.get('PORT', 8000))
    print(f"Starting CMMS test server on port {port}")
    
    with make_server('0.0.0.0', port, application) as httpd:
        print(f"Serving on http://0.0.0.0:{port}")
        httpd.serve_forever()
