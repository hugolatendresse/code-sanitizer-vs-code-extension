import urllib.request
import re
import json
# Load projects from a .json file
projects = json.loads(open("top-pypi-packages-30-days.min.json").read())
# Extract the project names in projects
project_names = [project["project"] for project in projects]

# Add standard library!
import sys
project_names.extend(list(sys.stdlib_module_names))

# Save to json
with open("top-pypi-project-names-all.json", "w") as f:
    json.dump(project_names, f)

print('done')

