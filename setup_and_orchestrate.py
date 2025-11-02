
#!/usr/bin/env python3
# High-level orchestrator that runs environment checks, suggests fixes, generates UI forms
# for entities defined in PSIR samples, starts a monitoring API and launches a GUI.
# Each function is resilient against missing modules and will print useful instructions when disabled.
import orchestrator.verify_environment as ve
import orchestrator.auto_fixer as af
import orchestrator.component_generator as cg
import orchestrator.monitor_builder as mb
import orchestrator.gui_launcher as gl

def main():
    # Step 1: check environment
    env = ve.check_environment()
    print("Environment check:", env)
    # Step 2: suggest fixes
    af.run_fixers(env)
    # Step 3: generate components (forms)
    try:
        cg.generate_components()
    except Exception as e:
        print("Component generation failed:", e)
    # Step 4: start monitoring
    try:
        mb.start_monitor()
    except Exception as e:
        print("Monitor could not be started:", e)
    # Step 5: launch GUI
    try:
        gl.launch_gui(ve.check_environment, af.run_fixers, cg.generate_components, mb.start_monitor)
    except Exception as e:
        print("GUI could not be launched:", e)

if __name__ == "__main__":
    main()
