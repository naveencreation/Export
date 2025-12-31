# Product Requirements Document (PRD)

## Admin Product Dashboard (Internal)

---

## 1. Product Overview

### Product Name (Working)

**AdminBoard**

### Purpose

AdminBoard is an **internal admin dashboard** for managing a product catalog.

It allows administrators to:

* View catalog-level analytics
* Manage product listings by category
* Add, edit, delete products
* Control inventory quantity and quality-related attributes

This is  **not customer-facing** .

---

## 2. Target Users

### Primary User

* Internal Admin / Operations Team

### Permissions

* Full CRUD access to products and categories
* Read-only access to analytics

---

## 3. Final Technology Stack (Locked)

### Frontend

* **Next.js (App Router)**
* **Tailwind CSS v3**
* **shadcn/ui**
* TypeScript

### Backend

* **Node.js**
* **Express.js**
* **SQLite**
* **ORM: Prisma** ✅ *(recommended for Node + SQLite)*

> Prisma is chosen because:
>
> * Best SQLite support in Node
> * Strong schema typing
> * Easy migration to PostgreSQL later
> * Excellent DX with Cursor

### Database

* SQLite (MVP & local)
* PostgreSQL-ready schema

---

## 4. System Architecture

<pre class="overflow-visible! px-0!" data-start="1396" data-end="1486"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre!"><span><span>Next</span><span>.js</span><span> (Frontend)
   ↓ </span><span>REST</span><span> API
Node + Express (Backend)
   ↓ ORM
SQLite Database
</span></span></code></div></div></pre>

---

## 5. Application Layout & Navigation

### Global Layout

* **Sidebar (Left)**
  * Company Logo placeholder
  * Overview
  * Products
  * Add / Edit Products
* **Top Bar**
  * Page title
  * Future user menu placeholder

### Routes

| Route              | Page               |
| ------------------ | ------------------ |
| `/`              | Overview Dashboard |
| `/products`      | Product Listing    |
| `/products/edit` | Add / Edit Product |

---

## 6. Page Requirements

---

## 6.1 Overview Page (Dashboard)

### Objective

Show catalog health at a glance.

### UI Components

* Stat Cards:
  * Total Products
  * Total Categories
  * In-Stock Products
  * Low-Stock Products
  * Out-of-Stock Products

### Data Source

* `GET /api/dashboard/stats`

### MVP Rule

* No charts
* Cards only

---

## 6.2 Product Listing Page

### Objective

Browse, filter, and manage products.

### Features

* Product table
* Category filter
* Search by product name
* Pagination
* Edit action per row

### Table Columns

| Column   | Description   |
| -------- | ------------- |
| Image    | Thumbnail     |
| Name     | Product name  |
| Category | Category name |
| Price    | Numeric       |
| Quantity | Integer       |
| Status   | Derived       |
| Actions  | Edit          |

### Inventory Status Logic (Derived)

* `quantity > 10` → **In Stock**
* `1–10` → **Low Stock**
* `0` → **Out of Stock**

⚠️ Status **must not** be stored in DB.

---

## 6.3 Product Edit Page

### Objective

Create, update, or delete products.

### Modes

* Add Product
* Edit Product
* Delete Product

### Form Fields

| Field       | Type     | Required |
| ----------- | -------- | -------- |
| Name        | Text     | Yes      |
| Description | Textarea | No       |
| Category    | Select   | Yes      |
| Price       | Number   | Yes      |
| Quantity    | Number   | Yes      |
| Image URL   | Text     | No       |

### UX Rules

* Same form for Add & Edit
* Client-side validation
* Disable submit during API calls

---

## 7. Backend API Specification (Express)

### Products

| Method | Endpoint              | Description     |
| ------ | --------------------- | --------------- |
| GET    | `/api/products`     | List products   |
| GET    | `/api/products/:id` | Product details |
| POST   | `/api/products`     | Create product  |
| PUT    | `/api/products/:id` | Update product  |
| DELETE | `/api/products/:id` | Delete product  |

---

### Categories

| Method | Endpoint            | Description     |
| ------ | ------------------- | --------------- |
| GET    | `/api/categories` | List categories |
| POST   | `/api/categories` | Create category |

---

### Dashboard

| Method | Endpoint                 | Description       |
| ------ | ------------------------ | ----------------- |
| GET    | `/api/dashboard/stats` | Analytics summary |

---

## 8. Database Design (ORM Schema)

### Category Model

<pre class="overflow-visible! px-0!" data-start="3952" data-end="4081"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>Category</span><span> {
  id        </span><span>Int</span><span></span><span>@id</span><span></span><span>@default</span><span>(</span><span>autoincrement</span><span>())
  name      </span><span>String</span><span>
  createdAt </span><span>DateTime</span><span></span><span>@default</span><span>(</span><span>now</span><span>())
}
</span></span></code></div></div></pre>

### Product Model

<pre class="overflow-visible! px-0!" data-start="4101" data-end="4369"><div class="contain-inline-size rounded-2xl corner-superellipse/1.1 relative bg-token-sidebar-surface-primary"><div class="sticky top-[calc(--spacing(9)+var(--header-height))] @w-xl/main:top-9"><div class="absolute end-0 bottom-0 flex h-9 items-center pe-2"><div class="bg-token-bg-elevated-secondary text-token-text-secondary flex items-center gap-4 rounded-sm px-2 font-sans text-xs"></div></div></div><div class="overflow-y-auto p-4" dir="ltr"><code class="whitespace-pre! language-ts"><span><span>Product</span><span> {
  id          </span><span>Int</span><span></span><span>@id</span><span></span><span>@default</span><span>(</span><span>autoincrement</span><span>())
  name        </span><span>String</span><span>
  description </span><span>String</span><span>?
  price       </span><span>Float</span><span>
  quantity    </span><span>Int</span><span>
  imageUrl    </span><span>String</span><span>?
  categoryId  </span><span>Int</span><span>
  createdAt   </span><span>DateTime</span><span></span><span>@default</span><span>(</span><span>now</span><span>())
  updatedAt   </span><span>DateTime</span><span></span><span>@updatedAt</span><span>
}
</span></span></code></div></div></pre>

---

## 9. Backend Architecture Rules

* MVC-style separation:
  * routes/
  * controllers/
  * services/
  * prisma/
* No business logic inside routes
* Validation before DB writes
* Central error handler

---

## 10. Non-Functional Requirements

### Performance

* <2s page load
* Efficient indexed queries

### Security

* Input validation
* CORS config
* Auth placeholder (future)

### Maintainability

* Typed ORM models
* Reusable services
* Clean folder structure

---

## 11. MVP Scope

### Included

* Dashboard stats
* Product CRUD
* Category management
* SQLite DB
* Clean UI

### Excluded

* Authentication
* Image uploads
* Charts
* Orders
* Roles

---

## 12. Future Enhancements

* JWT authentication
* PostgreSQL migration
* Image upload (S3/Cloudinary)
* Inventory alerts
* Audit logs
* Role-based access

---

## 13. Success Criteria

* Admin can manage products without errors
* Inventory status auto-updates correctly
* Dashboard reflects real data
* Codebase is Cursor-editable without refactor
