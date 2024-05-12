import urllib.request
import re
import json
# Load projects from a .json file
projects = json.loads(open("top-pypi-packages-30-days.min.json").read())
print("1")
# Extract the project names in projects
project_names = [project["project"] for project in projects]
print("2")

# Save to json
with open("top-pypi-project-names.json", "w") as f:
    json.dump(project_names, f)
print("3")
