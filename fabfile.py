from fabric.api import *


TRANSFORM_JSX_COMMAND = "jsx < codereaderapp/static/codereaderapp/index.jsx > codereaderapp/static/codereaderapp/index.js"


def deploy(project_root):
    test()
    local("git push")
    with cd(project_root):
        run("git pull")
        run(TRANSFORM_JSX_COMMAND)
        run("python3 manage.py collectstatic --clear --noinput")
        run("python3 manage.py migrate")
        run("python3 manage.py test")


def test():
    transformjsx()
    local("python3 manage.py test")


def transformjsx():
    local(TRANSFORM_JSX_COMMAND)
