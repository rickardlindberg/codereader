import subprocess

from django.core.management.base import BaseCommand

from codereaderapp.models import Project


class Command(BaseCommand):

    def handle(self, *args, **kwargs):
        for project in Project.objects.all():
            self._reannotate(project)

    def _reannotate(self, project):
        self.stdout.write("Reannotating %s" % project)
        self._update_source_code(project)

    def _update_source_code(self, project):
        subprocess.call(
            ["git", "pull"],
            cwd=project.root,
            stdout=self.stdout,
            stderr=self.stderr
        )
