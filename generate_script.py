import yaml
import subprocess
import shutil

# Charger le fichier YAML
with open("states.yaml", "r", encoding="utf-8") as file:
    data = yaml.safe_load(file)

# Ouvrir le fichier de sortie en AsciiDoc
with open("script/output.adoc", "w", encoding="utf-8") as adoc:
    adoc.write("= Chroniques des Sciences - Des cailloux aux octets\n")
    adoc.write("Thomah <5090230+Thomah@users.noreply.github.com>\n")
    adoc.write(":homepage: https://github.com/Thomah/chroniques-des-sciences")
    adoc.write(":reproducible:\n")
    adoc.write(":listing-caption: Listing\n")
    adoc.write(":source-highlighter: rouge\n")
    adoc.write(":linkcss:\n")
    adoc.write(":toc:\n")
    adoc.write(":title-page:\n\n")

    current_act = None
    
    for section, events in data.items():
        act_number = section.split("_")[0]
        act_title = f"Act {act_number}"
        fragment_number = 1
        
        if current_act != act_number:
            adoc.write(f"\n== {act_title}\n\n")
            current_act = act_number
        
        slide_number = section.replace("_", ".")
        adoc.write(f"\n[.transition]_Slide {slide_number}_\n\n")

        for event in events:
            trigger = event.get("trigger")
            exec = event.get("exec")
            text = event.get("args", "")

            if exec in ["narrator", "human", "speak"] and text:
                if trigger == "fragment":
                    adoc.write(f"\n[.transition]_Fragment {slide_number}.{fragment_number}_\n\n")
                    fragment_number += 1
                if exec == "narrator":
                    adoc.write(f"_{text}_\n\n")
                elif exec == "human":
                    adoc.write("\n.Prof. Calvet\n[role=\"char1\"]\n****\n")
                    adoc.write(f"{text}\n\n****\n")
                elif exec == "speak":
                    adoc.write("\n.Jack\n[role=\"char2\"]\n****\n")
                    adoc.write(f"{text}\n\n****\n")

# Find the full path of the executables
bundle_path = shutil.which("bundle")
ruby_path = shutil.which("ruby")

if not bundle_path or not ruby_path:
    raise FileNotFoundError("Could not find 'bundle' or 'ruby' in the system PATH")

# Convert to PDF
subprocess.run([bundle_path, "install"])
subprocess.run([ruby_path, "generate_script_pdf.rb"])

print("Script generated successfully.")
