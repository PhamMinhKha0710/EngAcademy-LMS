import mysql.connector
import json

try:
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="",
        database="english_learning"
    )
    cursor = conn.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM CLASS")
    classes = cursor.fetchall()
    
    cursor.execute("SELECT id, name FROM SCHOOL")
    schools = cursor.fetchall()
    
    cursor.execute("SELECT id, username FROM USERS")
    users = cursor.fetchall()

    print(json.dumps({
        "classes": classes,
        "schools": schools,
        "users": users
    }, default=str, indent=2))
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
