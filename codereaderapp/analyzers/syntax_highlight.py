from pygments.formatter import Formatter
from pygments import highlight
from pygments.lexers import guess_lexer_for_filename
from pygments.token import STANDARD_TYPES

from codereaderapp.annotations import Annotation
from codereaderapp.annotations import Annotations


def get_annotations(name):
    class MyFormatter(Formatter):
        def format(self, tokenstream, outfile):
            self.annotation_list = []
            row = 1
            column = 1
            for (token_type, text) in tokenstream:
                parts = text.split("\n")
                new_row = row + len(parts) - 1
                if len(parts) > 1:
                    new_column = len(parts[-1]) + 1
                else:
                    new_column = column + len(parts[-1])
                self.annotation_list.append(Annotation(
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
                column = new_column
    content = open(name).read()
    lexer = guess_lexer_for_filename(name, content)
    formatter = MyFormatter()
    highlight(content, lexer, formatter)
    return Annotations(formatter.annotation_list)
