class FileList(object):

    def __init__(self, files):
        self._files = files

    def render(self):
        return {
            'files': self._files,
        }
