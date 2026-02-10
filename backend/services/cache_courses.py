import json
from scrape_courses import course_dictionary

with open('degree_courses.json', 'w') as f:
    json.dump(dict(course_dictionary), f, indent=2)

with open('degree_courses.json', 'r') as f:
    course_dictionary = json.load(f)