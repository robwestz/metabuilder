
import shutil
import subprocess

# Return True if a command exists on the PATH and can be executed.
def check_command(cmd: str) -> bool:
    return shutil.which(cmd) is not None

# Attempt to call `cmd --version` and return its first line, or empty string on failure.
def check_version(cmd: str) -> str:
    try:
        out = subprocess.check_output([cmd, "--version"], stderr=subprocess.STDOUT, text=True)
        return out.strip().splitlines()[0]
    except Exception:
        return ""

# Check for required tools like node, pnpm, python and pip.
# Returns a dict mapping tool names to a status boolean and version string.
def check_environment() -> dict:
    tools = ["node", "pnpm", "python3", "pip3", "uvicorn"]
    results = {}
    for t in tools:
        present = check_command(t)
        version = check_version(t) if present else "missing"
        results[t] = {"present": present, "version": version}
    return results

if __name__ == "__main__":
    print(check_environment())
