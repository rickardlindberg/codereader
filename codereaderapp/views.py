from django.shortcuts import render


def file(request):
    from django.http import HttpResponse
    return HttpResponse("hello world")
