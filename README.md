ask 14 -- Product Image Upload with Admin Authentication

Project Overview

Task 14 is a full-stack product management application built using
React, Flask, and MySQL.

The main objective of this project is to implement real server-side
product image uploading instead of storing image files directly in the
database.

The application also includes admin authentication and role-based
access. Public users can browse products and view product details,
while only a logged-in admin can add, edit, delete, upload, replace, or
remove product images.

Technologies Used

Frontend

React

Vite

React Router

Axios

React Context API

Custom React Hooks

CSS3

FormData API

Backend

Python

Flask

Flask-CORS

Flask-Bcrypt

Werkzeug

MySQL Connector

python-dotenv

Database

MySQL

Testing Tools

Postman

MySQL Workbench

Browser Developer Tools

Main Features

Public User

View all products

Search products

View individual product details

View product images

Responsive shopping-style interface

Admin

Secure admin login

Admin session authentication

Add new products

Upload product images

Instant image preview before upload

Edit existing products

Replace existing product images

Remove product images

Delete products

Logout

Protected frontend routes

Protected backend APIs

Image Upload

Real image file upload using multipart/form-data

Maximum image size: 2 MB

Supported formats:

PNG

JPG

JPEG

WEBP

Unique image names generated using UUID

Safe filenames using secure_filename

Images stored on the Flask server

Only the image URL/path is stored in MySQL

Project Structure

task14-image-upload-complete/
│
├── backend/
│   ├── static/
│   │   └── uploads/
│   │       └── .gitkeep
│   │
│   ├── venv/
│   ├── .env
│   ├── app.py
│   ├── config.py
│   ├── login.py
│   ├── seed_admin.py
│   ├── requirements.txt
│   └── schema.sql
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── AdminRoute.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AdminContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   └── useToast.js
│   │   │
│   │   ├── pages/
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── ProductDetail.jsx
│   │   │   └── ProductForm.jsx
│   │   │
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   │
│   ├── index.html
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md

Database Setup

Create the database:

CREATE DATABASE task14_db;
USE task14_db;

Products Table

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

Admins Table

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

The admin password is stored as a bcrypt hash, not as plain text.

Environment Configuration

Create a .env file inside the backend folder.

Example:

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=task14_db
SECRET_KEY=your_secret_key

Do not upload the real .env file or database password to GitHub.

Backend Installation

Open a terminal:

cd backend
python -m venv venv
.\venv\Scripts\activate

Install the required packages:

pip install flask flask-cors flask-bcrypt mysql-connector-python python-dotenv

You can also install from requirements.txt:

pip install -r requirements.txt

Run the Flask server:

python app.py

Backend runs at:

http://localhost:5000

Frontend Installation

Open another terminal:

cd frontend
npm install
npm run dev

Frontend normally runs at:

http://localhost:5173

Admin Setup

The project uses seed_admin.py to create the initial administrator.

Run:

cd backend
.\venv\Scripts\activate
python seed_admin.py

The password inserted into MySQL is hashed using Flask-Bcrypt.

For security, do not publish real admin credentials in the README.

API Endpoints

Public APIs

Health Check

GET /api/health

Checks whether Flask and MySQL are connected correctly.

Get All Products

GET /api/products

Returns all products.

Get Single Product

GET /api/products/:id

Returns one product by ID.

Admin Authentication APIs

Admin Login

POST /api/admin/login

Example body:

{
  "email": "admin@example.com",
  "password": "your_password"
}

When login succeeds, Flask creates an admin session.

Check Current Admin

GET /api/admin/me

Returns the current logged-in administrator if a valid session exists.

Admin Logout

POST /api/admin/logout

Clears the admin session.

Protected Admin APIs

The following APIs require an authenticated admin session.

Upload Image

POST /api/upload

Postman:

Body → form-data
Key: image
Type: File

Example response:

{
  "success": true,
  "message": "Image uploaded successfully",
  "image_url": "/static/uploads/unique-file-name.webp"
}

Create Product

POST /api/products

Example:

{
  "name": "Headphone",
  "description": "Wireless premium headphone",
  "price": 2499,
  "image_url": "/static/uploads/unique-file-name.webp"
}

Update Product

PUT /api/products/:id

Delete Product

DELETE /api/products/:id

Delete Image

POST /api/delete-image

These routes use the admin_required decorator.

If a user is not logged in, the backend returns:

{
  "success": false,
  "message": "Admin login required"
}

with HTTP status 401.

Image Upload Flow

The complete image flow is:

Admin selects image
        ↓
React validates file
        ↓
React creates instant preview
        ↓
FormData is created
        ↓
POST /api/upload
        ↓
Flask receives request.files["image"]
        ↓
File type and size are validated
        ↓
secure_filename() sanitizes the filename
        ↓
UUID generates a unique filename
        ↓
Image saved in backend/static/uploads
        ↓
Flask returns image_url
        ↓
React sends product data + image_url
        ↓
MySQL stores the image_url
        ↓
Home/Product Detail displays the server image

Why Use multipart/form-data?

JSON is suitable for normal text-based information such as:

{
  "name": "Phone",
  "price": 25000
}

An image is binary file data.

Therefore, React uses:

const formData = new FormData();
formData.append("image", selectedFile);

The file is sent using multipart/form-data.

Flask receives it using:

request.files["image"]

Why Use UUID?

Two users could upload files with the same name, for example:

product.jpg
product.jpg

Saving both using their original filenames could overwrite an existing
image.

The backend generates a unique name:

unique_filename = f"{uuid.uuid4().hex}.{extension}"

Example:

4c1ccc5371f145948eb08094cdd4966f.webp

This prevents filename collisions.

Why Use secure_filename()?

Uploaded filenames should not be trusted directly.

Werkzeug's:

secure_filename(file.filename)

sanitizes the supplied filename before the extension is processed.

The application then generates its own UUID filename for server storage.

Image Validation

The application validates both file type and file size.

Allowed extensions:

ALLOWED_EXTENSIONS = {
    "png",
    "jpg",
    "jpeg",
    "webp"
}

Maximum size:

MAX_FILE_SIZE = 2 * 1024 * 1024

This means the maximum image size is 2 MB.

The frontend also checks supported MIME types and size before uploading,
providing faster feedback to the user.

The backend validation remains important because frontend validation
alone can be bypassed.

Where Are Images Stored?

The actual image files are stored in:

backend/static/uploads/

Example:

backend/static/uploads/4c1ccc5371f145948eb08094cdd4966f.webp

The MySQL database does not store the image binary.

It stores only:

/static/uploads/4c1ccc5371f145948eb08094cdd4966f.webp

The React application displays it using the Flask server URL:

const SERVER_URL = "http://localhost:5000";

and:

<img
  src={`${SERVER_URL}${product.image_url}`}
  alt={product.name}
/>

Image Preview

Before uploading, React creates a temporary local preview using:

URL.createObjectURL(file)

This allows the administrator to check the selected image immediately.

The preview is only temporary.

The permanent image is the file saved by Flask under:

backend/static/uploads/

Image Replacement Flow

When editing a product:

Existing image
      ↓
Admin selects new image
      ↓
New image preview
      ↓
Upload new image first
      ↓
Receive new image_url
      ↓
Update product in MySQL
      ↓
Delete old image

Uploading the new image before deleting the old image helps avoid
leaving the product without an image if the new upload fails.

Authentication Flow

Admin Login Page
       ↓
Email + Password
       ↓
POST /api/admin/login
       ↓
Flask finds admin in MySQL
       ↓
Bcrypt verifies password
       ↓
Flask session created
       ↓
AdminContext receives admin data
       ↓
Admin controls become visible

The Axios instance uses:

withCredentials: true

This allows the browser to send the Flask session cookie with API
requests.

The Flask CORS configuration enables credentials for the React frontend.

Frontend Route Protection

AdminRoute.jsx protects admin-only React pages.

Concept:

if (loading) {
  return <div>Checking admin access...</div>;
}

if (!admin) {
  return <Navigate to="/admin/login" replace />;
}

return children;

Protected pages include:

/add-product
/products/:id/edit

Why Backend Protection Is Also Required

Hiding an Edit or Delete button in React is not security.

A user could manually send a request using Postman.

Therefore, the backend also checks the Flask session using:

@admin_required

Protected operations include:

POST   /api/upload
POST   /api/delete-image
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id

Public GET APIs remain accessible without admin login.

This provides both:

Frontend protection → Better user experience
Backend protection  → Actual security

React Context API

AdminContext stores the current administrator globally.

It provides values/functions such as:

admin
loading
login()
logout()

This allows components such as:

Navbar
Home
AdminLogin
AdminRoute

to access authentication state without passing props through many
components.

Custom Toast Hook

The project uses a reusable useToast custom hook instead of browser
alert() messages.

It is used for messages such as:

Product deleted successfully
Image uploaded successfully
Admin login required
Failed to load products

Toast notifications automatically disappear after a short period and
provide a smoother user experience than blocking browser alerts.

Shopping-Style UI

The frontend was redesigned with a responsive ecommerce-style interface.

UI improvements include:

Sticky navigation bar

Premium hero section

Product card grid

Product image hover zoom

Card hover animations

Live product search

Product count

Loading animation

Empty states

Responsive layouts

Rounded action buttons

Animated toast notifications

Professional admin login page

Mobile-friendly design

Live Product Search

The Home page filters products in React without requesting the backend
again for every keystroke.

The search checks:

Product name
Product description

Because the products are already loaded, filtering them locally gives
immediate search results and avoids unnecessary API requests.

Security Features

The project includes:

Bcrypt password hashing

Flask session authentication

Admin-only backend APIs

Protected React routes

Frontend role-based controls

Server-side file validation

Maximum upload size

Restricted image extensions

UUID filenames

Safe filename handling

Database credentials stored in .env

CORS configured for the React frontend

Git Ignore

Uploaded product images should normally not be committed to Git.

Example:

backend/static/uploads/*
!backend/static/uploads/.gitkeep

backend/.env
backend/venv/
frontend/node_modules/

.gitkeep keeps the empty uploads directory structure in Git without
committing uploaded product images.

Testing

Image Upload Testing

Tested:

Select an image.

Verify instant preview.

Submit product.

Verify image is saved under static/uploads.

Verify only image_url is stored in MySQL.

Verify image appears on Home.

Verify same image appears on Product Detail.

Refresh browser.

Verify image still appears.

Replace image.

Remove image.

Delete product.

Authentication Testing

Tested:

Admin login with valid credentials.

Invalid login.

Admin session check.

Admin logout.

Public product browsing.

Protected Add Product route.

Protected Edit Product route.

Protected image upload API.

Protected product create API.

Protected product update API.

Protected product delete API.

Protected delete-image API.

Postman Security Test

After logging out, sending:

POST /api/products

should return:

{
  "success": false,
  "message": "Admin login required"
}

After logging in through:

POST /api/admin/login

the same protected API can be used with the authenticated session.

Challenges Faced

1. Image Upload Integration

The most challenging part was coordinating two API requests.

The frontend first uploads the actual image:

POST /api/upload

Then it receives:

image_url

After that, React sends the product information and returned image URL
to the product API.

This taught me how frontend file uploads, backend storage, and database
records work together.

2. Image URL and File Storage

Initially, the browser could return a 404 if the database contained an
incorrect or old image path.

The issue was solved by ensuring:

Actual server file
        ↕
Returned image_url
        ↕
Database image_url

all refer to the same file.

3. Authentication and API Protection

Another important challenge was understanding the difference between
hiding frontend controls and securing the backend.

The solution was to use both:

AdminRoute → frontend protection
admin_required → backend protection

What I Learned

From this task I learned:

How real image uploading works

How to use FormData

Difference between JSON and multipart/form-data

How Flask handles uploaded files

How to validate image type and size

How to generate UUID filenames

How to use secure_filename

How to store image URLs in MySQL

How to preview images in React

How to replace and remove images

How to build Flask session authentication

How to hash passwords with Bcrypt

How to use React Context for authentication

How to create protected React routes

Why backend authorization is necessary

How React, Flask, MySQL, and server-side file storage work together

Application Flow

React Frontend
      ↓
Axios
      ↓
Flask API
      ↓
Authentication / Validation
      ↓
MySQL + static/uploads
      ↓
JSON Response
      ↓
React UI

For image uploading:

Image
 ↓
FormData
 ↓
Flask
 ↓
Validation
 ↓
UUID filename
 ↓
static/uploads
 ↓
image_url
 ↓
MySQL product
 ↓
React display

Mentor Explanation -- Short Version

In Task 14, I implemented real server-side product image uploading
using React and Flask. React validates the selected image, creates an
instant preview, and sends the file using FormData. Flask validates
the image type and size, generates a unique UUID filename, and stores
the actual file inside static/uploads. Flask returns the image URL,
and that URL is stored with the product information in MySQL. I also
added admin authentication using Flask sessions and Bcrypt. Public
users can browse products, while only the logged-in admin can add,
edit, delete, upload, replace, or remove images. I protected both the
React routes and the Flask APIs.

Conclusion

Task 14 demonstrates a complete full-stack product image management
workflow.

The project combines:

React + Flask + MySQL + server-side file storage + admin
authentication + responsive ecommerce UI

The main achievement is that uploaded images are stored as real server
files, MySQL stores only their paths, and product-management operations
are protected so only an authenticated administrator can modify the
catalogue.