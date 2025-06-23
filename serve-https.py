#!/usr/bin/env python3
"""
HTTPS server for X-ray Earth with self-signed certificate.
Required for device orientation API on iOS.
"""

import http.server
import ssl
import socket
import sys
import os
import tempfile
import subprocess

def get_local_ip():
    """Get the local IP address of this machine"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def create_self_signed_cert():
    """Create a self-signed certificate for HTTPS"""
    cert_dir = tempfile.mkdtemp()
    cert_file = os.path.join(cert_dir, "cert.pem")
    key_file = os.path.join(cert_dir, "key.pem")
    
    # Generate self-signed certificate
    subprocess.run([
        "openssl", "req", "-new", "-x509", "-keyout", key_file,
        "-out", cert_file, "-days", "365", "-nodes",
        "-subj", "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    ], capture_output=True)
    
    return cert_file, key_file

def main():
    port = 8443
    local_ip = get_local_ip()
    
    # Create self-signed certificate
    print("Creating self-signed certificate...", flush=True)
    cert_file, key_file = create_self_signed_cert()
    
    # Create HTTPS server
    server_address = ('', port)
    httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)
    
    # Wrap with SSL
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(cert_file, key_file)
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    print("\n🌍 X-ray Earth HTTPS Server", flush=True)
    print("=" * 50, flush=True)
    print(f"\n📱 To test on your phone:", flush=True)
    print(f"   https://{local_ip}:{port}", flush=True)
    print(f"\n💻 Or on this computer:", flush=True)
    print(f"   https://localhost:{port}", flush=True)
    print("\n⚠️  Your browser will show a security warning.", flush=True)
    print("   Click 'Advanced' and 'Proceed' to continue.", flush=True)
    print("\nPress Ctrl+C to stop the server.\n", flush=True)
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.", flush=True)
        # Clean up certificate files
        os.unlink(cert_file)
        os.unlink(key_file)
        os.rmdir(os.path.dirname(cert_file))
        sys.exit(0)

if __name__ == "__main__":
    main()