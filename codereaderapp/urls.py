from django.conf.urls import url

from . import views


urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^file_list$', views.file_list, name='file_list'),
    url(r'^file/$', views.file, name='file'),
    url(r'^directory/$', views.directory, name='directory'),
    url(r'^search/(.*)$', views.search, name='search'),
]
