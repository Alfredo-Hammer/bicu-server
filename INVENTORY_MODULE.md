# Inventory Module - Categories & Spare Parts

## ✅ Implementation Complete

This document describes the Categories and Spare Parts inventory module implementation.

---

## 📊 Database Schema

### Tables Created

#### `categories`
- `id` - Serial primary key
- `name` - VARCHAR(100) UNIQUE NOT NULL
- `description` - TEXT
- `active` - BOOLEAN (default: true)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

#### `spare_parts`
- `id` - Serial primary key
- `name` - VARCHAR(150) NOT NULL
- `description` - TEXT
- `category_id` - INTEGER (FK to categories)
- `stock` - INTEGER (default: 0, CHECK >= 0)
- `min_stock` - INTEGER (default: 1, CHECK >= 0)
- `location` - VARCHAR(150)
- `image_url` - TEXT
- `active` - BOOLEAN (default: true)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Indexes
- Categories: name, active
- Spare Parts: name, category_id, active, stock

---

## 🔐 API Endpoints

### Categories

#### Get All Categories
```http
GET /api/categories
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Categories retrieved successfully",
  "data": [...]
}
```

#### Get Category by ID
```http
GET /api/categories/:id
Authorization: Bearer <token>
```

#### Create Category (Admin only)
```http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Cables",
  "description": "Cables de red y poder"
}
```

#### Update Category (Admin only)
```http
PUT /api/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Category (Admin only - Soft Delete)
```http
DELETE /api/categories/:id
Authorization: Bearer <token>
```

**Note:** Cannot delete categories with associated spare parts.

---

### Spare Parts

#### Get All Spare Parts (with filters)
```http
GET /api/spare-parts
GET /api/spare-parts?search=RAM
GET /api/spare-parts?category=2
GET /api/spare-parts?lowStock=true
Authorization: Bearer <token>
```

**Query Parameters:**
- `search` - Search in name and description
- `category` - Filter by category ID
- `lowStock` - Show only items with stock <= min_stock

#### Get Spare Part by ID
```http
GET /api/spare-parts/:id
Authorization: Bearer <token>
```

**Response includes:**
- All spare part fields
- `category_name` - Joined from categories table
- `is_low_stock` - Boolean flag (stock <= min_stock)

#### Create Spare Part (Admin only)
```http
POST /api/spare-parts
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Memoria RAM DDR4 8GB",
  "description": "Kingston DDR4 2666MHz",
  "category_id": 2,
  "stock": 15,
  "min_stock": 5,
  "location": "Estante A-3"
}
```

#### Update Spare Part (Admin only)
```http
PUT /api/spare-parts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated name",
  "stock": 20,
  "min_stock": 8
}
```

#### Delete Spare Part (Admin only - Soft Delete)
```http
DELETE /api/spare-parts/:id
Authorization: Bearer <token>
```

#### Get Low Stock Items
```http
GET /api/spare-parts/low-stock
Authorization: Bearer <token>
```

---

## 🛡️ Security & Authorization

### Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Role-Based Access Control

| Endpoint | Admin | Técnico | Supervisor |
|----------|-------|---------|------------|
| GET (all) | ✅ | ✅ | ✅ |
| POST | ✅ | ❌ | ❌ |
| PUT | ✅ | ❌ | ❌ |
| DELETE | ✅ | ❌ | ❌ |

---

## ✅ Business Rules Implemented

1. **Stock cannot be negative** - Database constraint + service validation
2. **Duplicate category names prevented** - Service layer validation
3. **Category deletion protection** - Cannot delete if has spare parts
4. **Soft delete only** - Records marked as `active = false`
5. **Low stock detection** - Automatic flag when `stock <= min_stock`
6. **Required field validation** - Name is required for both entities
7. **Category validation** - Spare parts validate category exists

---

## 📁 File Structure

```
server/src/
├── models/
│   ├── categoryModel.js       # Category data access
│   └── sparePartModel.js      # Spare part data access
├── services/
│   ├── categoryService.js     # Category business logic
│   └── sparePartService.js    # Spare part business logic
├── controllers/
│   ├── categoryController.js  # Category HTTP handlers
│   └── sparePartController.js # Spare part HTTP handlers
└── routes/
    ├── categoryRoutes.js      # Category endpoints
    └── sparePartRoutes.js     # Spare part endpoints

database/
└── inventory.sql              # Schema + sample data
```

---

## 🧪 Testing Examples

### 1. Login and get token
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@bicu.edu.ni","password":"admin123"}'
```

### 2. Get all categories
```bash
curl -X GET http://localhost:5001/api/categories \
  -H "Authorization: Bearer <token>"
```

### 3. Create a spare part
```bash
curl -X POST http://localhost:5001/api/spare-parts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SSD 240GB",
    "description": "Kingston A400",
    "category_id": 3,
    "stock": 3,
    "min_stock": 10,
    "location": "Estante B-1"
  }'
```

### 4. Search spare parts
```bash
curl -X GET "http://localhost:5001/api/spare-parts?search=RAM" \
  -H "Authorization: Bearer <token>"
```

### 5. Get low stock items
```bash
curl -X GET "http://localhost:5001/api/spare-parts?lowStock=true" \
  -H "Authorization: Bearer <token>"
```

---

## ✅ Verified Functionality

- ✅ Create categories
- ✅ List categories
- ✅ Update categories
- ✅ Soft delete categories (with protection)
- ✅ Create spare parts
- ✅ List spare parts
- ✅ Search spare parts by name/description
- ✅ Filter spare parts by category
- ✅ Filter low stock items
- ✅ Update spare parts
- ✅ Soft delete spare parts
- ✅ Stock validation (no negatives)
- ✅ Low stock detection
- ✅ JWT authentication on all routes
- ✅ Role-based authorization

---

## 📝 Sample Data Included

The migration includes 6 sample categories:
1. Procesadores
2. Memoria RAM
3. Discos Duros
4. Tarjetas Madre
5. Fuentes de Poder
6. Periféricos

---

## 🚀 Next Steps

The inventory module is ready for:
- Entries (purchases/stock additions)
- Outputs (parts used in repairs)
- Equipment management
- Audit logs
- Reports generation

All future modules will build on this foundation.
