from django.db import models


class Project(models.Model):

    slug = models.SlugField(unique=True)
    name = models.CharField(max_length=255)
    root = models.CharField(max_length=255)

    def __str__(self):
        return self.name
