from django.core.management.base import BaseCommand

from codereaderapp.models import Project
from codereaderlib.scm import Scm


class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        for project in Project.objects.all():
            self._reannotate(project)

    def _reannotate(self, project):
        self.stdout.write("Reannotating %s" % project)
        Scm.get(project.root, self.stdout, self.stderr).update()
