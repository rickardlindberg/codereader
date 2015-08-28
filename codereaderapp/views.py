from django.shortcuts import render
from django.http import JsonResponse


def index(request):
    return render(request, 'codereaderapp/index.html')


def file_list(request):
    return JsonResponse({
        'files': ['hello.js', 'foo.html'],
    })


def file(request):
    return JsonResponse({
        'name': 'hello.django.js',
        'lines': [
              {'row': 1, 'text': 'import foo'},
              {'row': 2, 'text': 'foo.hello()'},
              {'row': 3, 'text': ''},
              {'row': 4, 'text': 'import sys'},
              {'row': 5, 'text': 'sys.exit(1)'},
        ],
    })
