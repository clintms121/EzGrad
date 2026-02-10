TODO:

- Style login page
- Style landing page and add basic button functionalities
- Main landing page needs to include a:
- welcome logo
- degree selection option
- current year selection
- completed courses after selecting your degree
- frontend needs to send formatted json data to backend in this form:

front end should send in this format:
{
"username": "student123",
"degree": "Computer Science, B.S.",
"currentYear": 2,
"completedCourses": [
"ENGL 1113",
"MATH 1513",
"CS 1113",
"HIST 2483"
]
}

the backend response should be
{
"success": true,
"remainingCourses": [
"CS 2123",
"MATH 2214",
"ENGL 1213"
],
"recommendedSchedule": {
"nextSemester": ["CS 2123", "MATH 2214"],
"followingSemester": ["ENGL 1213"]
}
}
