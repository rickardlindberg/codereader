import subprocess

from django.shortcuts import render
from django.http import JsonResponse


def index(request):
    return render(request, 'codereaderapp/index.html')


def file_list(request):
    return JsonResponse({
        'files': subprocess.check_output(["ack", "-f"]).decode("utf-8").strip().split("\n"),
    })


def file(request, name):
    lines = []
    with open(name) as f:
        for (index, line) in enumerate(f):
            lines.append({
                'row': index + 1,
                'text': line,
            })
    return JsonResponse({
        'name': name,
        'lines': lines,
    })
