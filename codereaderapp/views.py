import os.path

from django.shortcuts import render
from django.http import JsonResponse

from codereaderlib.analyzers.syntax_highlight import get_annotations
from codereaderlib.annotations import Annotations
from codereaderlib.repo import Repo
from codereader.settings import USE_PROD_JS_CSS
from codereader.settings import REPO_ROOT


def index(request):
    return render(request, 'codereaderapp/index.html', {"USE_PROD_JS_CSS": USE_PROD_JS_CSS})


def file(request):
    name = request.GET.get("name")
    highlight = request.GET.get("highlight", "")
    return JsonResponse(Repo(REPO_ROOT).get_file(name).render_file(_get_annotations(REPO_ROOT, name, highlight)))


def directory(request):
    directory = request.GET.get("directory")
    items = []
    for name in os.listdir(os.path.join(REPO_ROOT, directory)):
        path = os.path.normpath(os.path.join(directory, name))
        if os.path.isdir(os.path.join(REPO_ROOT, path)):
            items.append({"type": "directory", "value": path, "text": name})
    for name in os.listdir(os.path.join(REPO_ROOT, directory)):
        path = os.path.normpath(os.path.join(directory, name))
        if not os.path.isdir(os.path.join(REPO_ROOT, path)):
            items.append({"type": "file", "value": path, "text": name})
    path = []
    while not os.path.samefile(REPO_ROOT, os.path.join(REPO_ROOT, directory)):
        path.insert(0, {"value": directory, "text": os.path.basename(directory)})
        directory = os.path.dirname(directory)
    path.insert(0, {"value": directory, "text": "Home"})
    result = {
        "path": path,
        "items": items,
    }
    return JsonResponse(result)


def search(request, term):
    return JsonResponse(Repo(REPO_ROOT).search(term).render())


def _get_annotations(root, name, highlight):
    return Annotations(
        get_annotations(os.path.join(root, name))
        +
        _get_highlight_annotations(root, name, highlight)
    )


def _get_highlight_annotations(root, name, highlight):
    if len(highlight.strip()) > 0:
        return Repo(root).search(highlight, name).get_annotations(name)
    return []
