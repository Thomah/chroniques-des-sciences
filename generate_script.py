import yaml
import subprocess

# Charger le fichier YAML
with open("states.yaml", "r", encoding="utf-8") as file:
    data = yaml.safe_load(file)

# Ouvrir le fichier de sortie en AsciiDoc
with open("script/output.adoc", "w", encoding="utf-8") as adoc:
    adoc.write("= Chroniques des Sciences - Des cailloux aux octets\n")
    adoc.write("Thomah <5090230+Thomah@users.noreply.github.com>\n")
    adoc.write(":reproducible:\n")
    adoc.write(":listing-caption: Listing\n")
    adoc.write(":source-highlighter: rouge\n")
    adoc.write(":linkcss:\n")
    adoc.write(":stylesdir: script/\n")
    adoc.write(":stylesheet: styles.css\n")
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
        adoc.write(f"\n_Slide {slide_number}_\n\n")

        for event in events:
            trigger = event.get("trigger")
            exec = event.get("exec")
            text = event.get("args", "")

            if exec in ["narrator", "human", "speak"] and text:
                if trigger == "fragment":
                    adoc.write(f"\n_Fragment {slide_number}.{fragment_number}_\n\n")
                    fragment_number += 1
                if exec == "narrator":
                    adoc.write(f"_{text}_\n\n")
                elif exec == "human":
                    adoc.write("[.text-center]\n**Prof. Calvet**\n\n")
                    adoc.write(f"{text}\n\n")
                elif exec == "speak":
                    adoc.write("[.text-center]\n**Jack**\n\n")
                    adoc.write(f"{text}\n\n")

# Convert to PDF
subprocess.run(["ruby", "generate_script_pdf.rb"])

print("Script generated successfully.")
