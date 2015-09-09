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
        result_by_file = {}
        for (name, row, start_column, end_column) in self._results:
            if name not in result_by_file:
                result_by_file[name] = {
                    "first_row": row,
                    "rows": [],
                }
            result_by_file[name]["rows"].extend([row-1, row, row+1])
        return {
            'matches': [
                {
                    "file": name,
                    "row_first_match": result_by_file[name]["first_row"],
                    "lines": File(self._root, name).render_lines(
                        Annotations(self.get_annotations(name)),
                        sorted(list(set(result_by_file[name]["rows"])))
                    ),
                }
                for name in sorted(result_by_file.keys())
            ],
        }

    def get_annotations(self, for_name):
        return [
            Annotation(
                row,
                start_column,
                row,
                end_column,
                {
                    "type": "style",
                    "what": "hll",
                }
            )
            for (name, row, start_column, end_column)
            in self._results
            if name == for_name
        ]
