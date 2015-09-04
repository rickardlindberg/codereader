import subprocess

from codereaderlib.search import SearchResult


class Repo(object):

    def __init__(self, root):
        self._root = root

    def search(self, term):
        result = SearchResult(self._root, term)
        ack_result = subprocess.check_output(["ack", "--column", "--output", "$&", term], cwd=self._root)
        for ack_line in ack_result.decode("utf-8").strip().split("\n"):
            parts = ack_line.split(":", 4)
            if len(parts) == 4:
                name = parts[0]
                row = int(parts[1])
                column = int(parts[2])
                match = parts[3]
                result.add(name, row, column, column-1+len(match))
        return result

