import subprocess

from django.shortcuts import render
from django.http import JsonResponse

from codereaderlib.analyzers.syntax_highlight import get_annotations
from codereaderlib import Annotations
from codereaderlib import FileRenderer


def index(request):
    return render(request, 'codereaderapp/index.html')


def file_list(request):
    return JsonResponse({
        'files': subprocess.check_output(["ack", "-f"]).decode("utf-8").strip().split("\n"),
    })


def file(request, name):
    return JsonResponse(FileRenderer(name).render_file(Annotations(get_annotations(name))))


def search(request, term):
    matches = []
    for ack_line in subprocess.check_output(["ack", "--column", "--output", "$&", term]).decode("utf-8").strip().split("\n"):
        parts = ack_line.split(":", 4)
        if len(parts) == 4:
            name = parts[0]
            row = int(parts[1])
            column = int(parts[2])
            match = parts[3]
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
            annotations = Annotations([x])
            matches.append({
                "file": name,
                "row": row,
                "lines": FileRenderer(name).render_lines(annotations, [row - 1, row, row + 1]),
            })
    return JsonResponse({
        'term': term,
        'matches': matches,
    })
