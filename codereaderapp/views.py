import os.path

from django.shortcuts import render
from django.http import JsonResponse

from codereaderlib.analyzers.syntax_highlight import get_annotations
from codereaderlib.annotation import Annotation
from codereaderlib.annotations import Annotations
from codereaderlib.file import File
from codereaderlib.files import list_files
from codereaderlib.repo import Repo


REPO_ROOT = "."


def index(request):
    return render(request, 'codereaderapp/index.html')


def file_list(request):
    return JsonResponse({
        'files': list_files(REPO_ROOT),
    })


def file(request, name):
    return JsonResponse(File(REPO_ROOT, name).render_file(Annotations(get_annotations(os.path.join(REPO_ROOT, name)))))


def search(request, term):
    return JsonResponse(Repo(REPO_ROOT).search(term).render())
