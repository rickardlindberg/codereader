from unittest.mock import sentinel
import unittest

from codereaderlib.annotation import Annotation
from codereaderlib.annotations import Annotations
from codereaderlib.line import Line


class TestLinePartition(unittest.TestCase):

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

    def test_two_annotations(self):
        self.assertEqual(
            Line(1, "hello").partition(Annotations([
                Annotation(1, 1, 1, 2, sentinel.ANNOTATION_1),
                Annotation(1, 2, 1, 3, sentinel.ANNOTATION_2),
            ])),
            [
                {
                    "text": "h",
                    "annotations": [sentinel.ANNOTATION_1],
                },
                {
                    "text": "e",
                    "annotations": [sentinel.ANNOTATION_1, sentinel.ANNOTATION_2],
                },
                {
                    "text": "l",
                    "annotations": [sentinel.ANNOTATION_2],
                },
                {
                    "text": "lo",
                    "annotations": [],
                },
            ]
        )

    def test_skips_annotations_where_line_does_not_match(self):
        self.assertEqual(
            Line(1, "hello").partition(Annotations([
                Annotation(1, 1, 1, 2, sentinel.ANNOTATION_1),
                Annotation(2, 1, 2, 3, sentinel.ANNOTATION_2),
            ])),
            [
                {
                    "text": "he",
                    "annotations": [sentinel.ANNOTATION_1],
                },
                {
                    "text": "llo",
                    "annotations": [],
                },
            ]
        )

    def test_newlines_get_no_annotations(self):
        self.assertEqual(
            Line(2, "this\n").partition(Annotations([
                Annotation(1, 1, 4, 3, sentinel.ANNOTATION),
            ])),
            [
                {
                    "text": "this",
                    "annotations": [sentinel.ANNOTATION],
                },
            ]
        )

    def test_empty_lines_generate_no_annotations(self):
        self.assertEqual(
            Line(2, "\n").partition(Annotations([
                Annotation(1, 1, 4, 3, sentinel.ANNOTATION),
            ])),
            [
            ]
        )


if __name__ == "__main__":
    unittest.main()
