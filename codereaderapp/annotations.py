class Annotations(object):

    def __init__(self, annotation_list):
        self._annotations_by_row = {}
        for annotation in annotation_list:
            for row in annotation.get_rows():
                if row not in self._annotations_by_row:
                    self._annotations_by_row[row] = []
                self._annotations_by_row[row].append(annotation)

    def get_intersections(self, line):
        intersections = set()
        for annotation in self._annotations_by_row.get(line.get_row(), []):
            intersections.update(annotation.get_intersections(line))
        return intersections

    def get_all_covering(self, row, column):
        return [
            annotation._data
            for annotation in self._annotations_by_row.get(row, [])
            if annotation.has_location(row, column)
        ]


class Annotation(object):

    def __init__(self, start_row, start_column, end_row, end_column, data):
        self._start_row = start_row
        self._start_column = start_column
        self._end_row = end_row
        self._end_column = end_column
        self._data = data

    def __eq__(self, other):
        return (self._start_row == other._start_row and
                self._start_column == other._start_column and
                self._end_row == other._end_row and
                self._end_column == other._end_column and
                self._data == other._data)

    def __ne__(self, other):
        return not (self == other)

    def __repr__(self):
        return "(%d, %d)-(%d, %d) %r" % (
            self._start_row,
            self._start_column,
            self._end_row,
            self._end_column,
            self._data)

    def get_intersections(self, line):
        intersections = set()
        if (self._is_after_start(line.get_row(), len(line.get_text())) and
            self._is_before_end(line.get_row(), 1)):
            intersections.add(self._start_column - 1)
            intersections.add(self._end_column)
        return intersections

    def get_rows(self):
        return list(range(self._start_row, self._end_row + 1))

    def has_location(self, row, column):
        return (self._is_after_start(row, column) and
                self._is_before_end(row, column))

    def _is_after_start(self, row, column):
        return (row > self._start_row or
                (row == self._start_row and column >= self._start_column))

    def _is_before_end(self, row, column):
        return (row < self._end_row or
                (row == self._end_row and column <= self._end_column))


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
