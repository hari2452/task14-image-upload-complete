from flask import Blueprint, jsonify, request, session
from flask_bcrypt import Bcrypt
from functools import wraps

from config import get_db


login_bp = Blueprint("login", __name__)

bcrypt = Bcrypt()


def admin_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if "admin_id" not in session:
            return jsonify({
                "success": False,
                "message": "Admin login required"
            }), 401

        return func(*args, **kwargs)

    return wrapper


@login_bp.route("/api/admin/login", methods=["POST"])
def admin_login():
    db = None
    cursor = None

    try:
        data = request.get_json(silent=True) or {}

        email = str(data.get("email", "")).strip().lower()
        password = str(data.get("password", ""))

        if not email or not password:
            return jsonify({
                "success": False,
                "message": "Email and password are required"
            }), 400

        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, name, email, password
            FROM admins
            WHERE email = %s
            """,
            (email,)
        )

        admin = cursor.fetchone()

        if not admin:
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        if not bcrypt.check_password_hash(
            admin["password"],
            password
        ):
            return jsonify({
                "success": False,
                "message": "Invalid email or password"
            }), 401

        session["admin_id"] = admin["id"]
        session["admin_name"] = admin["name"]
        session["admin_email"] = admin["email"]

        return jsonify({
            "success": True,
            "message": "Login successful",
            "admin": {
                "id": admin["id"],
                "name": admin["name"],
                "email": admin["email"]
            }
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


@login_bp.route("/api/admin/logout", methods=["POST"])
def admin_logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logout successful"
    }), 200


@login_bp.route("/api/admin/me", methods=["GET"])
def admin_me():
    if "admin_id" not in session:
        return jsonify({
            "success": False,
            "message": "Not logged in"
        }), 401

    return jsonify({
        "success": True,
        "admin": {
            "id": session["admin_id"],
            "name": session.get("admin_name"),
            "email": session.get("admin_email")
        }
    }), 200