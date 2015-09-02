import subprocess

from django.shortcuts import render
from django.http import JsonResponse

from codereaderapp.analyzers.syntax_highlight import get_annotations
from codereaderapp.annotations import Annotations
from codereaderapp.annotations import Line


def index(request):
    return render(request, 'codereaderapp/index.html')


def file_list(request):
    return JsonResponse({
        'files': subprocess.check_output(["ack", "-f"]).decode("utf-8").strip().split("\n"),
    })


def file(request, name):
    lines = []
    annotations = Annotations(get_annotations(name))
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


def search(request, term):
    matches = []
    for ack_line in subprocess.check_output(["ack", "--column", "--output", "$&", term]).decode("utf-8").strip().split("\n"):
        parts = ack_line.split(":", 4)
        if len(parts) == 4:
            name = parts[0]
            row = int(parts[1])
            column = int(parts[2])
            match = parts[3]
            lines = []
            from codereaderapp.annotations import Annotation
            x = Annotation(
                    row,
                    column,
                    row,
                    column-1+len(match),
                    {
                        "type": "style",
                        "what": "hll",
                    })
            annotations = Annotations(get_annotations(name) + [x])
            with open(name) as f:
                for (index, line) in enumerate(f):
                    if (index + 1) in [row - 1, row, row + 1]:
                        lines.append({
                            'row': index + 1,
                            'parts': Line(index + 1, line).partition(annotations),
                        })
            matches.append({
                "file": name,
                "row": row,
                "lines": lines,
            })
    return JsonResponse({
        'term': term,
        'matches': matches,
    })
