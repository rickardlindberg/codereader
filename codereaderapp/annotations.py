import unittest
from unittest.mock import sentinel


class Annotations(object):

    def __init__(self, annotation_list):
        self._annotations_list = annotation_list

    def get_intersections(self, line):
        intersections = set()
        for annotation in self._annotations_list:
            for intersection in annotation.get_intersections(line):
                intersections.add(intersection)
        return intersections

    def get_all_covering(self, row, column):
        x = []
        for annotation in self._annotations_list:
            if annotation.has_location(row, column):
                x.append(annotation._data)
        return x


class Annotation(object):

    def __init__(self, start_row, start_column, end_row, end_column, data):
        self._start_row = start_row
        self._start_column = start_column
        self._end_row = end_row
        self._end_column = end_column
        self._data = data

    def get_intersections(self, line):
        return {self._start_column - 1, self._end_column}

    def has_location(self, row, column):
        return (column >= self._start_column and
                column <= self._end_column)


class Line(object):

    def __init__(self, row, text):
        self._row = row
        self._text = text

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


class TestPartify(unittest.TestCase):

    def test_no_annotations(self):
        self.assertEqual(
            Line(1, "hello").partition(Annotations([
            ])),
            [
                {
                    "text": "hello",
                    "annotations": [],
                },
            ]
        )

    def test_one_annotation(self):
        self.assertEqual(
            Line(1, "hello").partition(Annotations([
                Annotation(1, 1, 1, 2, sentinel.ANNOTATION),
            ])),
            [
                {
                    "text": "he",
                    "annotations": [sentinel.ANNOTATION],
                },
                {
                    "text": "llo",
                    "annotations": [],
                },
            ]
        )


if __name__ == "__main__":
    unittest.main()
