from fabric.api import *


def deploy(project_root):
    local("python3 manage.py test")
    local("git push")
    with cd(project_root):
        run("git pull")
        run("python3 manage.py collectstatic --clear --noinput")
        run("python3 manage.py migrate")
        run("python3 manage.py test")
