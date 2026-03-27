from pathlib import Path

from django.http import FileResponse, Http404


BASE_DIR = Path(__file__).resolve().parent.parent
DIST_DIR = BASE_DIR / "dist"


def serve_react_app(_request):
    index_path = DIST_DIR / "index.html"
    if not index_path.exists():
        raise Http404("React build not found. Run `npm run build`.")
    return FileResponse(index_path.open("rb"))
