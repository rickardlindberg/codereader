import json
import os.path
import tempfile

from django.db.utils import IntegrityError
from django.test import TestCase

from codereaderapp.models import Project


class ViewTestCase(TestCase):

    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()

    def tearDown(self):
        self.tmp_dir.cleanup()

    def create_project(self, slug, name="Test project"):
        project = Project()
        project.name = name
        project.slug = slug
        project.root = os.path.join(self.tmp_dir.name, slug)
        project.save()
        self._ensure_exists(project.root)

    def write_file(self, path, lines):
        full_path = os.path.join(*([self.tmp_dir.name] + path))
        self._ensure_exists(os.path.dirname(full_path))
        with open(full_path, "w") as f:
            for line in lines:
                f.write(line)

    def get_json(self, url):
        return json.loads(self.client.get(url).content.decode("utf8"))

    def _ensure_exists(self, directory):
        if not os.path.exists(directory):
            os.makedirs(directory)


class TestIndexView(ViewTestCase):

    def test_has_title(self):
        response = self.client.get("/")
        self.assertContains(response, "<title>Code Reader</title>")

    def test_empty_project_list(self):
        response = self.client.get("/")
        self.assertQuerysetEqual(response.context["projects"], [
        ])

    def test_non_empty_project_list(self):
        self.create_project("test1", "Test 1")
        self.create_project("test2", "Test 2")
        response = self.client.get("/")
        self.assertQuerysetEqual(response.context["projects"], [
            "<Project: Test 1>",
            "<Project: Test 2>",
        ], ordered=False)


class TestProjectView(ViewTestCase):

    def test_existing_project(self):
        self.create_project("test", "Test Project")
        response = self.client.get("/test/")
        self.assertEqual(response.context["project"].name, "Test Project")

    def test_non_existing_project(self):
        response = self.client.get("/test/")
        self.assertEqual(response.status_code, 404)


class TestCodeReaderApp(TestCase):

    def setUp(self):
        self.tmp_dir = tempfile.TemporaryDirectory()
        with open(os.path.join(self.tmp_dir.name, "README"), "w") as f:
            f.write("line 1\n")
            f.write("line 2\n")
            f.write("line 3\n")
            f.write("line 4\n")
            f.write("line 5\n")
        test_project = Project()
        test_project.name = "Test Project"
        test_project.slug = "test"
        test_project.root = self.tmp_dir.name
        test_project.save()

    def test_file(self):
        json_response = self.get_json("/test/file/?name=README")
        self.assertEqual(json_response["name"], "README")
        self.assertEqual(len(json_response["lines"]), 5)

    def test_file_highlight(self):
        json_response = self.get_json("/test/file/?name=README&highlight=5")
        self.assertEqual(json_response["name"], "README")
        self.assertEqual(json_response["lines"][4]["parts"], [
            {"text": "line ", "annotations": []},
            {"text": "5",     "annotations": [{"type": "style", "what": "hll"}]},
            {"text": "\n",    "annotations": []},
        ])

    def test_search(self):
        json_response = self.get_json("/test/search/4")
        self.assertEqual(len(json_response["matches"]), 1)
        self.assertEqual(json_response["matches"][0]["row_first_match"], 4)

    def get_json(self, url):
        return json.loads(self.client.get(url).content.decode("utf8"))


class TestProject(TestCase):

    def test_slug_is_unique(self):
        Project(slug="test").save()
        self.assertRaises(IntegrityError, Project(slug="test").save)
