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


def file(request, name):
    return JsonResponse(Repo(REPO_ROOT).get_file(name).render_file(Annotations(get_annotations(os.path.join(REPO_ROOT, name)))))


def search(request, term):
    return JsonResponse(Repo(REPO_ROOT).search(term).render())
