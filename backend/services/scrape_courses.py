"""
Docstring for backend.scraping.scrape_courses

HTML CODE BEING STRIPPED FOR REFERENCE -> Degree Name
<h1 id="acalog-page-title">Business Information Technology, Computer Network Administration Option, B.S.</h1>
    
HTML CODE BEING STRIPPED FOR REFERENCE -> Course Codes
<li class="acalog-course">
  <span>
    <a href="#" aria-expanded="false" onclick="showCourse(...); return false;">
      POLS 1113&nbsp;-&nbsp;American Federal Government
    </a>  
    <strong>3</strong>
  </span>
</li>
"""

import requests
from bs4 import BeautifulSoup
from collections import defaultdict
import time

main_url = "https://catalog.rsu.edu/content.php?catoid=3&navoid=89"
base_url = "https://catalog.rsu.edu/"

course_dictionary = defaultdict(list)

response = requests.get(main_url)
soup = BeautifulSoup(response.content, "html.parser") 

degree_links = soup.find_all("a", href=lambda x: x and 'preview_program.php' in x)

for link in degree_links:
    degree_name = link.get_text(strip=True)
    href = link.get('href')

    if not href.startswith('http'):
        program_url = base_url + href
    else:
        program_url = href

    try:
        program_response = requests.get(program_url)
        program_soup = BeautifulSoup(program_response.text, 'html.parser')

        course_items = program_soup.find_all('li', class_='acalog-course')

        for item in course_items:
          a_tag = item.find('a')
          if a_tag:
              full_text = a_tag.get_text(strip=True)
              course_code = full_text.split('-')[0].strip()
              course_dictionary[degree_name].append(course_code)

        #avoid overwheliming the server
        time.sleep(0.5)

    except Exception as e:
        print(f"Error fetching {program_url}: {e}")

print(course_dictionary)
   
    
    







