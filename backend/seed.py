from flask_bcrypt import Bcrypt
from config import get_db

bcrypt = Bcrypt()

name = "Store Admin"
email = "admin@uploadstore.com"
password = "Admin@123"

hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

db = None
cursor = None

try:
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        "SELECT id FROM admins WHERE email = %s",
        (email,)
    )

    existing_admin = cursor.fetchone()

    if existing_admin:
        print("Admin already exists")
    else:
        cursor.execute(
            """
            INSERT INTO admins (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (name, email, hashed_password)
        )

        db.commit()

        print("Admin created successfully")
        print("Email:", email)
        print("Password:", password)

except Exception as e:
    print("Error:", e)

finally:
    if cursor:
        cursor.close()

    if db and db.is_connected():
        db.close()