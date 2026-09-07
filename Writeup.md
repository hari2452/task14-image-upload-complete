ask 14 – Short Write-up

1. What is multipart/form-data?
I used multipart/form-data to send the image file from React to Flask. JSON is mainly used for normal text data, but FormData can send actual files.

2. How do you create a unique filename?
I used UUID:

unique_filename = f"{uuid.uuid4().hex}.{extension}"

This prevents images with the same name from overwriting each other.

3. What image validation did you use?
I allowed only these formats:

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
MAX_FILE_SIZE = 2 * 1024 * 1024

So only supported images under 2 MB can be uploaded.

4. Where is the image stored?
Flask stores the actual image in:

backend/static/uploads/

The database stores only the image URL:

/static/uploads/<filename>

React displays it using:

http://localhost:5000 + product.image_url

Simple flow:
Select Image → FormData → Flask → Validate → UUID Filename → Save Image → Store URL in MySQL → Display in React