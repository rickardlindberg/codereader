import os.path

from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.shortcuts import render

from codereaderapp.models import Project
from codereaderlib.analyzers.syntax_highlight import get_annotations
from codereaderlib.annotations import Annotations
from codereaderlib.repo import Repo
from codereader.settings import USE_PROD_JS_CSS


def index(request):
    return render(request, 'codereaderapp/index.html', {
        "USE_PROD_JS_CSS": USE_PROD_JS_CSS,
        "projects": Project.objects.all(),
    })


def project(request, project_slug):
    return render(request, 'codereaderapp/project.html', {
        "USE_PROD_JS_CSS": USE_PROD_JS_CSS,
        "project": get_object_or_404(Project, slug=project_slug),
    })


def file(request, project_slug):
    project = Project.objects.get(slug=project_slug)
    name = request.GET.get("name")
    highlight = request.GET.get("highlight", "")
    return JsonResponse(Repo(project.root).get_file(name).render_file(_get_annotations(project.root, name, highlight)))


def directory(request, project_slug):
    project = Project.objects.get(slug=project_slug)
    directory = request.GET.get("directory")
    items = []
    for name in os.listdir(os.path.join(project.root, directory)):
        path = os.path.normpath(os.path.join(directory, name))
        if os.path.isdir(os.path.join(project.root, path)):
            items.append({"type": "directory", "value": path, "text": name})
    for name in os.listdir(os.path.join(project.root, directory)):
        path = os.path.normpath(os.path.join(directory, name))
        if not os.path.isdir(os.path.join(project.root, path)):
            items.append({"type": "file", "value": path, "text": name})
    path = []
    while not os.path.samefile(project.root, os.path.join(project.root, directory)):
        path.insert(0, {"value": directory, "text": os.path.basename(directory)})
        directory = os.path.dirname(directory)
    path.insert(0, {"value": directory, "text": "Home"})
    result = {
        "path": path,
        "items": items,
    }
    return JsonResponse(result)


def search(request, project_slug, term):
    project = Project.objects.get(slug=project_slug)
    return JsonResponse(Repo(project.root).search(term).render())


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
