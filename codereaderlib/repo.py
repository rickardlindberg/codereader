import subprocess

from codereaderlib.file import File
from codereaderlib.filelist import FileList
from codereaderlib.searchresult import SearchResult


class Repo(object):

    def __init__(self, root):
        self._root = root

    def search(self, term, search_only_in=None):
        result = SearchResult(self._root, term)
        cmd = ["ack", "-H", "--column", "--output", "$&", term]
        if search_only_in is not None:
            cmd.append(search_only_in)
        ack_result = subprocess.check_output(cmd, cwd=self._root)
        for ack_line in ack_result.decode("utf-8").strip().split("\n"):
            parts = ack_line.split(":", 4)
            if len(parts) == 4:
                name = parts[0]
                row = int(parts[1])
                column = int(parts[2])
                match = parts[3]
                result.add(name, row, column, column-1+len(match))
        return result

    def get_file(self, name):
        return File(self._root, name)
