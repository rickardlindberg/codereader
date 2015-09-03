import os.path

from codereaderlib.line import Line


class File(object):

    def __init__(self, root, name):
        self._root = root
        self._name = name

    def render_file(self, annotations):
        return {
            'name': self._name,
            'lines': self.render_lines(annotations),
        }

    def render_lines(self, annotations, only_rows=None):
        with open(os.path.join(self._root, self._name)) as f:
            lines = []
            for (index, line) in enumerate(f):
                row = index + 1
                if only_rows is None or row in only_rows:
                    lines.append({
                        'row': row,
                        'parts': Line(row, line).partition(annotations),
                    })
            return lines
