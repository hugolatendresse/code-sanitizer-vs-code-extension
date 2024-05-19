import json

# Path to the JSON file
file_path = 'R_packages_download_cnt.json'

# Load the JSON data from the file
with open(file_path, 'r') as f:
    data = json.load(f)

packages = [(d['package_name'], d['download_count']) for d in data]

to_install = []
for name, cnt in packages:
    if (
            (
                    (cnt > 10 ** 6)  # Include any package with over 1 million downloads
                    or ("actu" in name.lower() and cnt > 10 ** 3)  # Include any package with "actu" and over 1000 downloads
                    or ("glm" in name.lower() and cnt > 10 ** 4)  # Include any package with "glm"  over 10000 downloads
            )
            and not (name.lower() not in ['ggeffects'])  # Exclusions that don't work well

    ):
        to_install.append(name)

with open('R_supported_packages.json', 'w') as f:
    json.dump(to_install, f, indent=4)
