# B.unique Handmade Jewellery

A complete handmade-jewellery e-commerce application with a customer storefront and a separate admin panel.
The storefront and admin UI are built with **React 18 + Bootstrap 5**, the API with **Java 17 + Spring Boot 3**,
and data is stored in **MySQL**.

The original PHP implementation is still present in the repository root for reference (`*.php`, `admin/`,
`config/`, `includes/`). The React/Spring Boot application lives in `frontend/` and `backend/`.

## Features

### User (Storefront)
- Homepage with hero slider, category showcase, featured / new / best-seller products
- Shop with category filter, quick filters, sorting, pagination, and search
- Product details with image gallery, reviews & ratings, wishlist
- Cart with coupon support, checkout (COD / UPI), order placement
- Order tracking, order history, printable/downloadable order details, product rating
- User account: profile, change password, email verification, password reset
- Wishlist, contact form, newsletter subscription, FAQ / about / policies pages

### Admin
- Dashboard with sales statistics, recent orders, low-stock alerts, order-status breakdown
- Products (CRUD + gallery images + quick stock update), Categories (CRUD)
- Orders (list, details, status workflow with stock handling, printable invoice)
- Customers (list, detail, ban/activate, delete), Banners (CRUD), Coupons (CRUD)
- Reviews moderation, newsletter subscribers (CSV export), contact messages
- Settings (general, website, payment, SMTP), admin profile + password change

## Requirements

- **Java 17** (JDK)
- **Maven 3.8+** (or use the Maven binary bundled with your IDE)
- **Node.js 18+** and npm
- **MySQL 8** (or MySQL 5.7+) running on `localhost:3306`

## Setup

### 1. Database

Import the schema and seed data into MySQL:

```sql
SOURCE database/jewellery.sql;
```

Or from the command line:

```bash
mysql -u root -p < database/jewellery.sql
```

This creates the `bunique_jewellery` database with all tables and demo data. If your MySQL root account has a
password, update `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/bunique_jewellery?useSSL=false&serverTimezone=Asia/Kolkata&allowPublicKeyRetrieval=true
    username: root
    password: your-password
```

### 2. Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

The API starts at **http://localhost:8080**.

Uploaded images are served from `/uploads/**`. The backend resolves the upload directory from
`app.upload-dir` (`uploads` by default) and also checks `../uploads`, so the existing project-level
`uploads/` folder can be used directly.

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run start
```

The storefront opens at **http://localhost:3000** and proxies API calls to the Spring Boot server
(configured in `frontend/package.json`). For a production build:

```bash
npm run build
```

## Default Logins

| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin10@gmail.com | admin@#123 |
| User  | user@example.com  | user@123   |

- Customer login: `http://localhost:3000/login`
- Admin login: `http://localhost:3000/login` (admin credentials are detected automatically), or the
  dedicated endpoint `http://localhost:3000/admin` after signing in.

## Project Structure

```
backend/                       Spring Boot API
  src/main/java/com/bunique/app/
    config/                    Security, CORS, static uploads
    controller/                Public + admin REST controllers
    model/ repository/         JPA entities and repositories
    security/                  JWT service, filter, current-user helper
  src/main/resources/application.yml
frontend/                      React storefront + admin panel
  public/                      index.html, favicon, admin.css
  src/
    admin/                     Admin layout and pages
    assets/css/                Original design system stylesheets
    components/                Shared UI (navbar, footer, product card, banner)
    context/                   Auth and cart providers
    pages/                     Public pages
    services/                  Axios API client
database/jewellery.sql         MySQL schema + seed data
uploads/                       Product, category, banner and user images
```

## Notes

- Authentication uses JWT tokens stored in `localStorage` (`token`, `user`, `admin`). The axios client
  attaches `Authorization: Bearer <token>` to every API request.
- Admin endpoints verify the JWT role (`admin` / `super_admin`) server-side.
- With no SMTP credentials configured, verification/reset links and order emails are written to the
  **backend console** instead of being sent. Configure SMTP in Admin → Settings → SMTP to send real email.
- Product stock is restored when an order is cancelled/returned and re-deducted when it is reactivated.
- Coupon, tax and shipping rules come from the `settings` table (seeded tax 0%, 7-day returns).
- Google Fonts, Bootstrap 5 and Bootstrap Icons are loaded from CDN, matching the original design.
