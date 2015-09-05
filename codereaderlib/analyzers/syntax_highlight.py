from pygments.formatter import Formatter
from pygments import highlight
from pygments.lexers import get_lexer_for_filename
from pygments.lexers import TextLexer
from pygments.token import STANDARD_TYPES
from pygments.token import Token

from codereaderlib.annotation import Annotation


def get_annotations(name):
    with open(name) as f:
        content = f.read()
        try:
            lexer = get_lexer_for_filename(name, content)
        except:
            lexer = TextLexer()
        formatter = ExtractAnnotationsFormatter()
        highlight(content, lexer, formatter)
        return formatter.get_annotations()


class ExtractAnnotationsFormatter(Formatter):

    def __init__(self):
        Formatter.__init__(self)
        self._annotation_list = []

    def format(self, tokenstream, outfile):
        row = 1
        column = 1
        for (token_type, text) in tokenstream:
            parts = text.split("\n")
            new_row = row + len(parts) - 1
            if len(parts) > 1:
                new_column = len(parts[-1])
            else:
                new_column = column + len(parts[-1]) - 1
            if token_type is not Token.Text:
                self._annotation_list.append(Annotation(
                    row,
                    column,
                    new_row,
                    new_column,
                    {
                        "type": "style",
                        "what": STANDARD_TYPES.get(token_type, ""),
                    }
                ))
            row = new_row
            column = new_column + 1

    def get_annotations(self):
        return self._annotation_list
