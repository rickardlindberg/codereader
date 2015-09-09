from django.contrib import admin

from . import models


class ProjectAdmin(admin.ModelAdmin):

    fields = ["name", "slug", "root"]
    prepopulated_fields = {"slug": ("name",)}


admin.site.register(models.Project, ProjectAdmin)
