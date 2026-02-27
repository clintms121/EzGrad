"""
Scraping courses to make difficulty hashmap 

HTML Structure:
<li>
    <div style="float: right" class="gateway-toolbar clearfix"></div>
    <a style="float:right" href="..."></a>
    
    <h3>ACCT 2203 - Accounting II - Managerial</h3>
    <hr>
    <strong>3</strong> <strong>Credit Hour(s)</strong>
    <br><br>
    A first course in managerial accounting with emphasis on accounting tools for managers...
    <br><br>
    <strong>Prerequisite(s):</strong> 
    <a href="#tt5625" aria-label="View course details for ACCT 2103">ACCT 2103</a>
</li>

Key selectors:
- Course code & name: <h3> text (e.g., "ACCT 2203 - Accounting II - Managerial")
- Credit hours: first <strong> after <hr>
- Prerequisites: <a> tags after "Prerequisite(s):" with aria-label containing course code
"""

import requests
from bs4 import BeautifulSoup
import time

all_courses = []

page_one = "https://catalog.rsu.edu/content.php?filter%5B27%5D=-1&filter%5B29%5D=&filter%5Bcourse_type%5D=-1&filter%5Bkeyword%5D=&filter%5B32%5D=1&filter%5Bcpage%5D=1&cur_cat_oid=4&expand=1&navoid=131&print=1&filter%5Bexact_match%5D=1#acalog_template_course_filter"

response = requests.get(page_one)
soup = BeautifulSoup(response.content, "html.parser")

courses = soup.find_all('li')

for course in courses:
    h3 = course.find('h3')
    if h3:
        text = course.get_text(separator=' ', strip=True)
        all_courses.append(text)

print(all_courses)