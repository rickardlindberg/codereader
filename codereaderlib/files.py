import subprocess


def list_files(directory):
    ack_output = subprocess.check_output(["ack", "-f"], cwd=directory)
    return ack_output.decode("utf-8").strip().split("\n")
