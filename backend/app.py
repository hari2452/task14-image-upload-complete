from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
from config import get_db
from login import login_bp, admin_required

import os
import uuid

app = Flask(__name__)
app.secret_key = "task14-admin-secret-key"

CORS(
    app,
    origins=["http://localhost:5173"],
    supports_credentials=True
)

app.register_blueprint(login_bp)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MAX_FILE_SIZE = 2 * 1024 * 1024

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE


def allowed_file(filename):
    return (
        "." in filename
        and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS
    )


def serialize_product(product):
    if not product:
        return None

    result = dict(product)

    if result.get("price") is not None:
        result["price"] = float(result["price"])

    if result.get("created_at") is not None:
        result["created_at"] = result["created_at"].isoformat()

    return result


@app.route("/api/health", methods=["GET"])
def health():
    db = None

    try:
        db = get_db()

        return jsonify({
            "success": True,
            "message": "Backend and database are working"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:
        if db:
            db.close()


@app.route("/api/upload", methods=["POST"])
@admin_required
def upload_image():
    if "image" not in request.files:
        return jsonify({
            "success": False,
            "message": "No image provided"
        }), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({
            "success": False,
            "message": "No image selected"
        }), 400

    if not allowed_file(file.filename):
        return jsonify({
            "success": False,
            "message": "Only PNG, JPG, JPEG and WEBP files are allowed"
        }), 400

    safe_name = secure_filename(file.filename)
    extension = safe_name.rsplit(".", 1)[1].lower()

    unique_filename = f"{uuid.uuid4().hex}.{extension}"

    file_path = os.path.join(
        app.config["UPLOAD_FOLDER"],
        unique_filename
    )

    file.save(file_path)

    image_url = f"/static/uploads/{unique_filename}"

    return jsonify({
        "success": True,
        "message": "Image uploaded successfully",
        "image_url": image_url
    }), 201


@app.route("/api/delete-image", methods=["POST"])
@admin_required
def delete_image():
    try:
        data = request.get_json(silent=True) or {}
        image_url = data.get("image_url")

        if not image_url:
            return jsonify({
                "success": False,
                "message": "image_url is required"
            }), 400

        prefix = "/static/uploads/"

        if not image_url.startswith(prefix):
            return jsonify({
                "success": False,
                "message": "Invalid image path"
            }), 400

        filename = secure_filename(image_url[len(prefix):])

        if not filename:
            return jsonify({
                "success": False,
                "message": "Invalid filename"
            }), 400

        file_path = os.path.join(
            app.config["UPLOAD_FOLDER"],
            filename
        )

        if os.path.exists(file_path):
            os.remove(file_path)

        return jsonify({
            "success": True,
            "message": "Image deleted successfully"
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/api/products", methods=["POST"])
@admin_required
def create_product():
    db = None
    cursor = None

    try:
        data = request.get_json(silent=True) or {}

        name = data.get("name")
        description = data.get("description", "")
        price = data.get("price")
        image_url = data.get("image_url")

        if not name or price in (None, ""):
            return jsonify({
                "success": False,
                "message": "Name and price are required"
            }), 400

        db = get_db()
        cursor = db.cursor()

        cursor.execute("""
            INSERT INTO products
            (name, description, price, image_url)
            VALUES (%s, %s, %s, %s)
        """, (
            name,
            description,
            price,
            image_url
        ))

        db.commit()

        return jsonify({
            "success": True,
            "message": "Product created successfully",
            "product_id": cursor.lastrowid
        }), 201

    except Exception as e:
        if db:
            db.rollback()

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


@app.route("/api/products", methods=["GET"])
def get_products():
    db = None
    cursor = None

    try:
        # Task 15: pagination + server-side search
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 8, type=int)
        search = request.args.get("search", "").strip()

        # Prevent invalid values
        if page < 1:
            page = 1

        if limit < 1:
            limit = 8

        offset = (page - 1) * limit
        search_value = f"%{search}%"

        db = get_db()
        cursor = db.cursor(dictionary=True)

        # Count all matching products first
        cursor.execute("""
            SELECT COUNT(*) AS total
            FROM products
            WHERE name LIKE %s
               OR description LIKE %s
        """, (
            search_value,
            search_value
        ))

        total = cursor.fetchone()["total"]

        # Fetch only the current page
        cursor.execute("""
            SELECT
                id,
                name,
                description,
                price,
                image_url,
                created_at
            FROM products
            WHERE name LIKE %s
               OR description LIKE %s
            ORDER BY id DESC
            LIMIT %s OFFSET %s
        """, (
            search_value,
            search_value,
            limit,
            offset
        ))

        products = [
            serialize_product(product)
            for product in cursor.fetchall()
        ]

        total_pages = (total + limit - 1) // limit

        return jsonify({
            "success": True,
            "products": products,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": total_pages
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


@app.route("/api/products/<int:product_id>", methods=["GET"])
def get_product(product_id):
    db = None
    cursor = None

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, name, description, price,
                   image_url, created_at
            FROM products
            WHERE id = %s
        """, (product_id,))

        product = cursor.fetchone()

        if not product:
            return jsonify({
                "success": False,
                "message": "Product not found"
            }), 404

        return jsonify({
            "success": True,
            "product": serialize_product(product)
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


@app.route("/api/products/<int:product_id>", methods=["PUT"])
@admin_required
def update_product(product_id):
    db = None
    cursor = None

    try:
        data = request.get_json(silent=True) or {}

        name = data.get("name")
        description = data.get("description", "")
        price = data.get("price")
        image_url = data.get("image_url")

        if not name or price in (None, ""):
            return jsonify({
                "success": False,
                "message": "Name and price are required"
            }), 400

        db = get_db()
        cursor = db.cursor()

        cursor.execute("""
            UPDATE products
            SET name = %s,
                description = %s,
                price = %s,
                image_url = %s
            WHERE id = %s
        """, (
            name,
            description,
            price,
            image_url,
            product_id
        ))

        db.commit()

        if cursor.rowcount == 0:
            return jsonify({
                "success": False,
                "message": "Product not found"
            }), 404

        return jsonify({
            "success": True,
            "message": "Product updated successfully"
        }), 200

    except Exception as e:
        if db:
            db.rollback()

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


@app.route("/api/products/<int:product_id>", methods=["DELETE"])
@admin_required
def delete_product(product_id):
    db = None
    cursor = None

    try:
        db = get_db()
        cursor = db.cursor(dictionary=True)

        cursor.execute(
            "SELECT image_url FROM products WHERE id = %s",
            (product_id,)
        )
        product = cursor.fetchone()

        if not product:
            return jsonify({
                "success": False,
                "message": "Product not found"
            }), 404

        cursor.close()
        cursor = db.cursor()

        cursor.execute(
            "DELETE FROM products WHERE id = %s",
            (product_id,)
        )

        db.commit()

        image_url = product.get("image_url")

        if image_url and image_url.startswith("/static/uploads/"):
            filename = secure_filename(
                image_url.split("/static/uploads/")[-1]
            )
            file_path = os.path.join(
                app.config["UPLOAD_FOLDER"],
                filename
            )

            if os.path.exists(file_path):
                os.remove(file_path)

        return jsonify({
            "success": True,
            "message": "Product deleted successfully"
        }), 200

    except Exception as e:
        if db:
            db.rollback()

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:
        if cursor:
            cursor.close()

        if db:
            db.close()


@app.errorhandler(413)
def file_too_large(error):
    return jsonify({
        "success": False,
        "message": "Image size must be 2 MB or less"
    }), 413


if __name__ == "__main__":
    app.run(debug=True, port=5000)