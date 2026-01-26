import requests
from bs4 import BeautifulSoup

url = "https://catalog.rsu.edu/preview_program.php?catoid=3&poid=358&returnto=89"
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

course_items = soup.find_all('li', class_='acalog-course')
course_codes = []

"""
HTML CODE BEING STRIPPED FOR REFERENCE
<li class="acalog-course">
  <span>
    <a href="#" aria-expanded="false" onclick="showCourse(...); return false;">
      POLS 1113&nbsp;-&nbsp;American Federal Government
    </a>  
    <strong>3</strong>
  </span>
</li>
"""

for item in course_items:
    a_tag = item.find('a')
    if a_tag:
        full_text = a_tag.get_text(strip=True)
        course_code = full_text.split('-')[0].strip()
        course_codes.append(course_code)

print(course_codes)