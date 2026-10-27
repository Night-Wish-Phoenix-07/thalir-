import http.server
import socketserver
import webbrowser
import os

# Always serve files from the folder this script lives in
os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 8000

Handler = http.server.SimpleHTTPRequestHandler
# Windows sometimes labels .js files wrongly, which breaks Three.js. This fixes it.
Handler.extensions_map[".js"] = "application/javascript"

socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), Handler) as server:
    print(f"THALIR is running at http://localhost:{PORT}")
    print("Press Ctrl+C in this window to stop.")
    webbrowser.open(f"http://localhost:{PORT}")
    server.serve_forever()
