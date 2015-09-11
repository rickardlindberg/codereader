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
        if (self._is_after_start(line.get_row(), line.get_max_column()) and
            self._is_before_end(line.get_row(), 1)):

            if line.get_row() > self._start_row:
                intersections.add(0)
            else:
                intersections.add(self._start_column - 1)

            if line.get_row() < self._end_row:
                intersections.add(line.get_max_column())
            else:
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
