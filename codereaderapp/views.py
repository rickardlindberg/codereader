import os.path

from django.shortcuts import render
from django.http import JsonResponse

from codereaderlib.analyzers.syntax_highlight import get_annotations
from codereaderlib.annotations import Annotations
from codereaderlib.repo import Repo


REPO_ROOT = "."


def index(request):
    return render(request, 'codereaderapp/index.html')


def file_list(request):
    return JsonResponse(Repo(REPO_ROOT).get_file_list().render())


def file(request):
    name = request.GET.get("name")
    highlight = request.GET.get("highlight", "")
    return JsonResponse(Repo(REPO_ROOT).get_file(name).render_file(_get_annotations(REPO_ROOT, name, highlight)))


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
