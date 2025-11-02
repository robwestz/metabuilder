
def launch_gui(env_check, fix_func, gen_func, monitor_func) -> None:
    # Launch a simple Tkinter GUI to invoke orchestrator actions.
    # If Tkinter is not available, prints instructions to run via CLI.
    try:
        import tkinter as tk

        root = tk.Tk()
        root.title("MetaBuilder Orchestrator")
        root.geometry("300x200")

        def on_check():
            result = env_check()
            text.delete("1.0", tk.END)
            text.insert(tk.END, str(result))

        def on_fix():
            fix_func(env_check())

        def on_gen():
            gen_func()

        def on_mon():
            monitor_func()

        tk.Button(root, text="Check Env", command=on_check).pack(fill=tk.X, pady=2)
        tk.Button(root, text="Suggest Fixes", command=on_fix).pack(fill=tk.X, pady=2)
        tk.Button(root, text="Generate Forms", command=on_gen).pack(fill=tk.X, pady=2)
        tk.Button(root, text="Start Monitor", command=on_mon).pack(fill=tk.X, pady=2)
        text = tk.Text(root, height=6)
        text.pack(fill=tk.BOTH, expand=True)
        root.mainloop()
    except Exception as e:
        print("Tkinter GUI could not be launched:", e)
        print("Run orchestrator via CLI: see setup_and_orchestrate.py")
