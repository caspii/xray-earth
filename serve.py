#!/usr/bin/env python3
"""
Simple HTTPS server for testing X-ray Earth on mobile devices.
Device orientation APIs require HTTPS on most mobile browsers.
"""

import http.server
import ssl
import socket
import sys
import os

def get_local_ip():
    """Get the local IP address of this machine"""
    try:
        # Create a socket to determine local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def main():
    port = 8000
    local_ip = get_local_ip()
    
    # Try to find an available port
    for attempt_port in range(port, port + 100):
        try:
            server_address = ('', attempt_port)
            httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
            port = attempt_port
            break
        except OSError as e:
            if e.errno == 48:  # Address already in use
                continue
            else:
                raise
    else:
        print("Error: Could not find an available port")
        sys.exit(1)
    
    print("\n🌍 X-ray Earth Server", flush=True)
    print("=" * 50, flush=True)
    print(f"\n📱 To test on your phone, visit:", flush=True)
    print(f"   http://{local_ip}:{port}", flush=True)
    print(f"\n💻 Or on this computer:", flush=True)
    print(f"   http://localhost:{port}", flush=True)
    print("\n⚠️  Note: Some features require HTTPS. For production use,", flush=True)
    print("   deploy to a service like GitHub Pages or Netlify.", flush=True)
    print("\nPress Ctrl+C to stop the server.\n", flush=True)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)

if __name__ == "__main__":
    main()