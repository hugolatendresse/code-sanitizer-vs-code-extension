# https://www.datasciencemeta.com/rpackages contains the list of CRAN R packages sorted by downloads

import json
import requests
from bs4 import BeautifulSoup

url = 'https://www.datasciencemeta.com/rpackages'
response = requests.get(url)
response.raise_for_status()  # This will raise an HTTPError if the HTTP request returned an unsuccessful status code

soup = BeautifulSoup(response.text, 'html.parser')

packages_data = []
table = soup.find('table', class_='table')
for row in table.find_all('tr'):
    # Find all 'td' elements in the row
    cells = row.find_all('td')
    if len(cells) > 1:  # Make sure the row has enough columns
        # Extract package name from the anchor tag within the second 'td' element
        package_name = cells[1].find('a').text if cells[1].find('a') else 'N/A'
        # Extract download count from the third 'td' element
        download_count = cells[2].text.strip().replace(',', '')  # Remove commas for easier handling of the number
        # Append the tuple to the list
        # packages_downloads.append((package_name, download_count))
        packages_data.append({"package_name": package_name, "download_count": int(download_count)})

json_data = json.dumps(packages_data, indent=4)
with open('../assets/R_packages_download_cnt.json', 'w') as json_file:
    json_file.write(json_data)
