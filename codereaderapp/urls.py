from django.conf.urls import include
from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),

    url(r'^(?P<project_slug>[\w-]+)/', include([
        url(r'^$', views.project, name='project'),
        url(r'^file/$', views.file, name='file'),
        url(r'^directory/$', views.directory, name='directory'),
        url(r'^search/(?P<term>.*)$', views.search, name='search'),
    ])),
]
