import sqlite3
import hashlib

conn = sqlite3.connect("userdata.db")
cur = conn.cursor()

cur.execute("""
CREATE TABLE IF NOT EXISTS userdata (
            ID INTEGER PRIMARY KEY,
            username VARCHAR(255) NOT NULL,
            password VARCHAR(255) NOT NULL
)            
""")

username1, password1 = "clintms121", hashlib.sha256("clintPassword".encode()).hexdigest()
username2, password2 = "sampleUser", hashlib.sha256("sample2222".encode()).hexdigest()
username3, password3 = "man38", hashlib.sha256("manPassword".encode()).hexdigest()
username4, password4 = "JohnCherry", hashlib.sha256("ddddpassword".encode()).hexdigest()
cur.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username1, password1))
cur.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username2, password2))
cur.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username3, password3))
cur.execute("INSERT INTO userdata (username, password) VALUES (?, ?)", (username4, password4))

conn.commit()
