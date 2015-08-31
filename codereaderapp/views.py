import subprocess

from django.shortcuts import render
from django.http import JsonResponse

from codereaderapp.analyzers.syntax_highlight import get_annotations
from codereaderapp.annotations import Line


def index(request):
    return render(request, 'codereaderapp/index.html')


def file_list(request):
    return JsonResponse({
        'files': subprocess.check_output(["ack", "-f"]).decode("utf-8").strip().split("\n"),
    })


def file(request, name):
    lines = []
    annotations = get_annotations(name)
    with open(name) as f:
        for (index, line) in enumerate(f):
            lines.append({
                'row': index + 1,
                'parts': Line(index + 1, line).partition(annotations),
            })
    return JsonResponse({
        'name': name,
        'lines': lines,
    })
