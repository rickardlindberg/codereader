from codereaderlib.annotation import Annotation
from codereaderlib.annotations import Annotations
from codereaderlib.file import File


class SearchResult(object):

    def __init__(self, root, term):
        self._root = root
        self._term = term
        self._results = []

    def add(self, name, row, start_column, end_column):
        self._results.append((name, row, start_column, end_column))

    def render(self):
        matches = []
        for (name, row, start_column, end_column) in self._results:
            annotation = Annotation(
                row,
                start_column,
                row,
                end_column,
                {
                    "type": "style",
                    "what": "hll",
                }
            )
            matches.append({
                "file": name,
                "row": row,
                "lines": File(self._root, name).render_lines(Annotations([annotation]), [row-1, row, row+1]),
            })
        return {
            'term': self._term,
            'matches': matches,
        }

