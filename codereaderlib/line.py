class Line(object):

    def __init__(self, row, text):
        self._row = row
        self._text = text

    def get_row(self):
        return self._row

    def get_text(self):
        return self._text

    def partition(self, annotations):
        return [
            {
                "text": self._extract_text(start_column, end_column),
                "annotations": annotations.get_all_covering(self._row, start_column),
            }
            for (start_column, end_column) in self._get_regions(annotations)
        ]

    def _get_regions(self, annotations):
        intersections = self._get_intersections(annotations)
        for (previous_index, intersection) in enumerate(intersections[1:]):
            yield (
                intersections[previous_index] + 1,
                intersection
            )

    def _get_intersections(self, annotations):
        intersections = set()
        intersections.add(0)
        intersections.add(len(self._text))
        intersections.update(annotations.get_intersections(self))
        return sorted(list(intersections))

    def _extract_text(self, start_column, end_column):
        return self._text[start_column - 1 : end_column]
