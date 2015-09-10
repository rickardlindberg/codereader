import os.path
import tempfile
import unittest

from codereaderlib.repo import Repo


class TestSearch(unittest.TestCase):

    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        with open(os.path.join(self.tmp_dir.name, "README"), "w") as f:
            f.write("line 1\n")
            f.write("line 2\n")
            f.write("line 3\n")
            f.write("line 4\n")
            f.write("line 5\n")
        self.repo = Repo(self.tmp_dir.name)

    def tearDown(self):
        self.tmp_dir.cleanup()

    def test_search_one_match(self):
        self.assertEqual(self._render_without_parts(self.repo.search("2")), {
            "matches": [
                {
                    "file": "README",
                    "row_first_match": 2,
                    "lines": [
                        {"row": 1},
                        {"row": 2},
                        {"row": 3},
                    ],
                },
            ]
        })

    def test_search_two_matches(self):
        self.assertEqual(self._render_without_parts(self.repo.search("1|5")), {
            "matches": [
                {
                    "file": "README",
                    "row_first_match": 1,
                    "lines": [
                        {"row": 1},
                        {"row": 2},
                        {"row": 4},
                        {"row": 5},
                    ],
                },
            ]
        })

    def _render_without_parts(self, search_result):
        rendered = search_result.render()
        for match in rendered["matches"]:
            for line in match["lines"]:
                del line["parts"]
        return rendered


if __name__ == "__main__":
    unittest.main()
