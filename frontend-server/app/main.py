"""Lightweight FastAPI server to serve Next.js static export with proper routing."""
import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to the static export directory
STATIC_DIR = (Path(__file__).parent.parent / "static").resolve()


def _safe_path(base: Path, *parts: str) -> Path | None:
    """Resolve a path and ensure it stays within the base directory."""
    resolved = (base / Path(*parts)).resolve()
    if not str(resolved).startswith(str(base)):
        return None
    return resolved


@app.get("/_next/{path:path}")
async def next_assets(path: str):
    """Serve Next.js build assets."""
    file_path = _safe_path(STATIC_DIR, "_next", path)
    if file_path is not None and file_path.is_file():
        # Determine content type
        suffix = file_path.suffix
        media_types = {
            ".js": "application/javascript",
            ".css": "text/css",
            ".json": "application/json",
            ".map": "application/json",
            ".woff": "font/woff",
            ".woff2": "font/woff2",
            ".png": "image/png",
            ".jpg": "image/jpeg",
            ".svg": "image/svg+xml",
            ".ico": "image/x-icon",
            ".txt": "text/plain",
        }
        media_type = media_types.get(suffix, "application/octet-stream")
        return FileResponse(file_path, media_type=media_type)
    return HTMLResponse("Not found", status_code=404)


@app.get("/{path:path}")
async def serve_page(request: Request, path: str = ""):
    """Serve the correct static HTML page for each route."""
    # Remove trailing slash for path resolution
    clean_path = path.strip("/")

    if not clean_path:
        # Root path - serve index.html
        index_file = STATIC_DIR / "index.html"
        if index_file.is_file():
            return FileResponse(index_file, media_type="text/html")

    # Try exact file match first (for static assets like favicon.ico)
    exact_file = _safe_path(STATIC_DIR, clean_path)
    if exact_file is not None and exact_file.is_file():
        return FileResponse(exact_file)

    # Try directory with index.html (trailingSlash mode)
    dir_index = _safe_path(STATIC_DIR, clean_path, "index.html")
    if dir_index is not None and dir_index.is_file():
        return FileResponse(dir_index, media_type="text/html")

    # Try .html extension
    html_file = _safe_path(STATIC_DIR, f"{clean_path}.html")
    if html_file is not None and html_file.is_file():
        return FileResponse(html_file, media_type="text/html")

    # Fallback to root index.html for SPA routing
    fallback = STATIC_DIR / "index.html"
    if fallback.is_file():
        return FileResponse(fallback, media_type="text/html")

    return HTMLResponse("Not found", status_code=404)
