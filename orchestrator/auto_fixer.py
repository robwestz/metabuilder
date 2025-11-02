
# Print suggestions for missing tools based on environment check results.
def suggest_fixes(env: dict) -> None:
    for name, info in env.items():
        if not info["present"]:
            if name in ("node", "pnpm"):
                print(f"Install {name} via Node.js setup. See https://nodejs.org/")
            elif name.startswith("python"):
                print("Ensure Python 3 is installed. See https://www.python.org/downloads/")
            elif name.startswith("pip"):
                print("Install pip via `python -m ensurepip` or your package manager.")
            elif name == "uvicorn":
                print("Install uvicorn: pip install uvicorn")
        else:
            print(f"{name}: {info['version']}")

# Proxy function to call from orchestrator.
def run_fixers(env: dict) -> None:
    suggest_fixes(env)
