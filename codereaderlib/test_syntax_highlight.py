import os.path
import tempfile
import unittest

from codereaderlib.analyzers.syntax_highlight import get_annotations
from codereaderlib.annotation import Annotation


class TestSyntaxHighlight(unittest.TestCase):

    def test_can_highlight_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = os.path.join(tmp, "foo.py")
            with open(path, "w") as f:
                f.write("import unittest\n")
                f.write("import os.path\n")
            self.assertEqual(
                get_annotations(path),
                [
                    Annotation(1, 1, 1, 6, {"type": "style", "what": "kn"}),
                    Annotation(1, 8, 1, 15, {"type": "style", "what": "nn"}),
                    Annotation(2, 1, 2, 6, {"type": "style", "what": "kn"}),
                    Annotation(2, 8, 2, 14, {"type": "style", "what": "nn"}),
                ]
            )


if __name__ == "__main__":
    unittest.main()
