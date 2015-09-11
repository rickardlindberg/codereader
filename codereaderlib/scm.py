import os
import subprocess


class Scm(object):

    def __init__(self, root, stdout, stderr):
        self._root = root
        self._stdout = stdout
        self._stderr = stderr

    @staticmethod
    def get(root, stdout, stderr):
        return Scm._get_scm_class(root)(root, stdout, stderr)

    @staticmethod
    def _get_scm_class(root):
        if os.path.exists(os.path.join(root, ".git")):
            return Git
        elif os.path.exists(os.path.join(root, ".hg")):
            return Mercurial
        else:
            return Archive

    def run(self, cmd):
        subprocess.call(cmd,
            cwd=self._root,
            stdout=self._stdout,
            stderr=self._stderr
        )


class Git(Scm):

    def update(self):
        self.run(["git", "pull"])


class Mercurial(Scm):

    def update(self):
        self.run(["hg", "pull"])


class Archive(Scm):

    def update(self):
        pass

