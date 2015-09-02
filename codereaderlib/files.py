import subprocess


def list_files():
    return subprocess.check_output(["ack", "-f"]).decode("utf-8").strip().split("\n")
