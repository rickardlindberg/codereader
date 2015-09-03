import json

from django.test import TestCase


class TestCodeReaderApp(TestCase):

    def test_index(self):
        response = self.client.get("/")
        self.assertContains(response, "<title>Code Reader</title>")

    def test_file_list(self):
        json_response = self.get_json("/file_list")
        self.assertIn("manage.py", json_response["files"])

    def test_file(self):
        json_response = self.get_json("/file/manage.py")
        self.assertEqual(json_response["name"], "manage.py")
        self.assertGreater(len(json_response["lines"]), 1)

    def get_json(self, url):
        return json.loads(self.client.get(url).content.decode("utf8"))
