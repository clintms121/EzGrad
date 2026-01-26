import requests
from bs4 import BeautifulSoup

url = "https://catalog.rsu.edu/preview_program.php?catoid=3&poid=358&returnto=89"
response = requests.get(url)
soup = BeautifulSoup(response.text, 'html.parser')

course_items = soup.find_all('li', class_='acalog-course')
course_codes = []

for item in course_items:
    a_tag = item.find('a')
    if a_tag:
        full_text = a_tag.get_text(strip=True)
        course_code = full_text.split('-')[0].strip()
        course_codes.append(course_code)

print(course_codes)