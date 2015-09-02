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
