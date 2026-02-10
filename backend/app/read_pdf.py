#open source pdf reader
import pdfplumber

#declare map to track and store required classes 
degree_plan_map = {}

#declare map to track and store completed classes from transcript
transcript_map = {}

#read BTAI PDF
degree_plan = pdfplumber.open(r"../test/BTAI.pdf")
Need = ""

"""
with pdfplumber.open(r"../test/BTAI.pdf") as pdf:
    first_page = pdf.pages[0]
    print(first_page.chars[1])
"""


# functionality to loop through page until we find 