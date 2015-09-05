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
    x = []
    if len(highlight.strip()) > 0:
        x = Repo(REPO_ROOT).search(highlight, name).get_annotations().get(name, [])
    annotations = Annotations(
        get_annotations(os.path.join(REPO_ROOT, name))
        +
        x
    )
    return JsonResponse(Repo(REPO_ROOT).get_file(name).render_file(annotations))


def search(request, term):
    return JsonResponse(Repo(REPO_ROOT).search(term).render())
