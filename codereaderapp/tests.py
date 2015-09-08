import json
import os.path
import tempfile

from django.test import TestCase


class TestCodeReaderApp(TestCase):

    def setUp(self):
        from codereaderapp import views
        self.tmp_dir = tempfile.TemporaryDirectory()
        with open(os.path.join(self.tmp_dir.name, "README"), "w") as f:
            f.write("line 1\n")
            f.write("line 2\n")
            f.write("line 3\n")
            f.write("line 4\n")
            f.write("line 5\n")
        views.REPO_ROOT = self.tmp_dir.name

    def test_index(self):
        response = self.client.get("/")
        self.assertContains(response, "<title>Code Reader</title>")

    def test_file(self):
        json_response = self.get_json("/file/?name=README")
        self.assertEqual(json_response["name"], "README")
        self.assertEqual(len(json_response["lines"]), 5)

    def test_file_highlight(self):
        json_response = self.get_json("/file/?name=README&highlight=5")
        self.assertEqual(json_response["name"], "README")
        self.assertEqual(json_response["lines"][4]["parts"], [
            {"text": "line ", "annotations": []},
            {"text": "5",     "annotations": [{"type": "style", "what": "hll"}]},
            {"text": "\n",    "annotations": []},
        ])

    def test_search(self):
        json_response = self.get_json("/search/4")
        self.assertEqual(json_response["term"], "4")
        self.assertEqual(len(json_response["matches"]), 1)
        self.assertEqual(json_response["matches"][0]["row"], 4)

    def get_json(self, url):
        return json.loads(self.client.get(url).content.decode("utf8"))
