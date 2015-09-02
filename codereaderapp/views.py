import subprocess

from django.shortcuts import render
from django.http import JsonResponse

from codereaderlib.analyzers.syntax_highlight import get_annotations
from codereaderlib.annotation import Annotation
from codereaderlib.annotations import Annotations
from codereaderlib.file import File
from codereaderlib.files import list_files


def index(request):
    return render(request, 'codereaderapp/index.html')


def file_list(request):
    return JsonResponse({
        'files': list_files(),
    })


def file(request, name):
    return JsonResponse(File(name).render_file(Annotations(get_annotations(name))))


def do_search(term):
    ack_result = subprocess.check_output(["ack", "--column", "--output", "$&", term])
    for ack_line in ack_result.decode("utf-8").strip().split("\n"):
        parts = ack_line.split(":", 4)
        if len(parts) == 4:
            name = parts[0]
            row = int(parts[1])
            column = int(parts[2])
            match = parts[3]
            yield (
                name,
                Annotation(
                    row,
                    column,
                    row,
                    column-1+len(match),
                    {
                        "type": "style",
                        "what": "hll",
                    }
                )
            )


def search(request, term):
    matches = []
    for (name, annotation) in do_search(term):
        row = annotation.get_rows()[0]
        matches.append({
            "file": name,
            "row": row,
            "lines": File(name).render_lines(Annotations([annotation]), [row-1, row, row+1]),
        })
    return JsonResponse({
        'term': term,
        'matches': matches,
    })
