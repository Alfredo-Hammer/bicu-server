# Support Entities Module - Suppliers & Equipments

## ✅ Implementation Complete

This document describes the Suppliers and Equipments support entities implementation required for inventory movements.

---

## 📊 Database Schema

### Tables Created

#### `suppliers`
- `id` - Serial primary key
- `name` - VARCHAR(150) NOT NULL
- `phone` - VARCHAR(50)
- `email` - VARCHAR(150)
- `address` - TEXT
- `active` - BOOLEAN (default: true)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

#### `equipments`
- `id` - Serial primary key
- `code` - VARCHAR(50) UNIQUE NOT NULL
- `type` - VARCHAR(50) NOT NULL
- `brand` - VARCHAR(100)
- `model` - VARCHAR(100)
- `serial_number` - VARCHAR(100)
- `location` - VARCHAR(150)
- `status` - VARCHAR(50) (active, in_repair, retired)
- `created_at` - TIMESTAMP
- `updated_at` - TIMESTAMP

### Indexes
- Suppliers: name, active
- Equipments: code, serial_number, type, status

---

## 🔐 API Endpoints

### Suppliers

#### Get All Suppliers
```http
GET /api/suppliers
Authorization: Bearer <token>
```

#### Get Supplier by ID
```http
GET /api/suppliers/:id
Authorization: Bearer <token>
```

#### Create Supplier (Admin only)
```http
POST /api/suppliers
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Distribuidora Tecnológica",
  "phone": "2888-9999",
  "email": "ventas@distec.ni",
  "address": "Plaza España, Managua"
}
```

#### Update Supplier (Admin only)
```http
PUT /api/suppliers/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "2888-9999",
  "email": "new@email.com",
  "address": "New Address"
}
```

#### Delete Supplier (Admin only - Soft Delete)
```http
DELETE /api/suppliers/:id
Authorization: Bearer <token>
```

---

### Equipments

#### Get All Equipments (with filters)
```http
GET /api/equipments
GET /api/equipments?type=PC
GET /api/equipments?status=in_repair
GET /api/equipments?search=Dell
Authorization: Bearer <token>
```

**Query Parameters:**
- `type` - Filter by equipment type (PC, Laptop, Printer, etc.)
- `status` - Filter by status (active, in_repair, retired)
- `search` - Search in code, brand, or model

#### Get Equipment by ID
```http
GET /api/equipments/:id
Authorization: Bearer <token>
```

#### Create Equipment (Admin & Técnico)
```http
POST /api/equipments
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "PC-LAB-003",
  "type": "PC",
  "brand": "Dell",
  "model": "OptiPlex 5090",
  "serial_number": "SN567890",
  "location": "Laboratorio 2",
  "status": "active"
}
```

**Valid Types:** PC, Laptop, Printer, Server, Monitor, Scanner, Router, Switch

**Valid Statuses:** active, in_repair, retired

#### Update Equipment (Admin only)
```http
PUT /api/equipments/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "PC-LAB-002",
  "type": "PC",
  "brand": "Lenovo",
  "model": "ThinkCentre M720",
  "serial_number": "SN345678",
  "location": "Laboratorio 1",
  "status": "active"
}
```

#### Delete Equipment (Admin only - Sets status to 'retired')
```http
DELETE /api/equipments/:id
Authorization: Bearer <token>
```

---

## 🛡️ Security & Authorization

### Authentication
All endpoints require JWT authentication via `Authorization: Bearer <token>` header.

### Role-Based Access Control

#### Suppliers

| Endpoint | Admin | Técnico | Supervisor |
|----------|-------|---------|------------|
| GET (all) | ✅ | ✅ | ✅ |
| POST | ✅ | ❌ | ❌ |
| PUT | ✅ | ❌ | ❌ |
| DELETE | ✅ | ❌ | ❌ |

#### Equipments

| Endpoint | Admin | Técnico | Supervisor |
|----------|-------|---------|------------|
| GET (all) | ✅ | ✅ | ✅ |
| POST | ✅ | ✅ | ❌ |
| PUT | ✅ | ❌ | ❌ |
| DELETE | ✅ | ❌ | ❌ |

**Note:** Técnicos can create equipments (to register devices they're repairing) but cannot modify or delete them.

---

## ✅ Business Rules Implemented

### Suppliers
1. **Name is required** - Cannot create supplier without name
2. **Duplicate prevention** - Cannot have same name + phone combination
3. **Soft delete only** - Records marked as `active = false`
4. **All fields validated** - Trimmed and sanitized

### Equipments
1. **Code is required and unique** - Uppercase, unique identifier
2. **Type validation** - Must be one of valid types
3. **Status validation** - Must be one of: active, in_repair, retired
4. **Equipment code uniqueness** - Prevents duplicates
5. **Soft delete** - Sets status to 'retired' instead of physical delete
6. **Search and filter support** - By type, status, or text search

---

## 📁 File Structure

```
server/src/
├── models/
│   ├── supplierModel.js       # Supplier data access
│   └── equipmentModel.js      # Equipment data access
├── services/
│   ├── supplierService.js     # Supplier business logic
│   └── equipmentService.js    # Equipment business logic
├── controllers/
│   ├── supplierController.js  # Supplier HTTP handlers
│   └── equipmentController.js # Equipment HTTP handlers
└── routes/
    ├── supplierRoutes.js      # Supplier endpoints
    └── equipmentRoutes.js     # Equipment endpoints

database/
└── support_entities.sql       # Schema + sample data
```

---

## 🧪 Testing Examples

### 1. Get all suppliers
```bash
curl -X GET http://localhost:5001/api/suppliers \
  -H "Authorization: Bearer <token>"
```

### 2. Create a supplier
```bash
curl -X POST http://localhost:5001/api/suppliers \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Distribuidora Tecnológica",
    "phone": "2888-9999",
    "email": "ventas@distec.ni",
    "address": "Plaza España, Managua"
  }'
```

### 3. Get all equipments
```bash
curl -X GET http://localhost:5001/api/equipments \
  -H "Authorization: Bearer <token>"
```

### 4. Create an equipment
```bash
curl -X POST http://localhost:5001/api/equipments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PC-LAB-003",
    "type": "PC",
    "brand": "Dell",
    "model": "OptiPlex 5090",
    "serial_number": "SN567890",
    "location": "Laboratorio 2",
    "status": "active"
  }'
```

### 5. Filter equipments by type
```bash
curl -X GET "http://localhost:5001/api/equipments?type=PC" \
  -H "Authorization: Bearer <token>"
```

### 6. Filter equipments by status
```bash
curl -X GET "http://localhost:5001/api/equipments?status=in_repair" \
  -H "Authorization: Bearer <token>"
```

### 7. Update equipment status
```bash
curl -X PUT http://localhost:5001/api/equipments/3 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "PC-LAB-002",
    "type": "PC",
    "brand": "Lenovo",
    "model": "ThinkCentre M720",
    "serial_number": "SN345678",
    "location": "Laboratorio 1",
    "status": "active"
  }'
```

---

## ✅ Verified Functionality

### Suppliers
- ✅ List all suppliers
- ✅ Get supplier by ID
- ✅ Create supplier
- ✅ Update supplier
- ✅ Soft delete supplier
- ✅ Duplicate name+phone validation
- ✅ Required field validation

### Equipments
- ✅ List all equipments
- ✅ Get equipment by ID
- ✅ Create equipment
- ✅ Update equipment
- ✅ Soft delete equipment (status = retired)
- ✅ Filter by type
- ✅ Filter by status
- ✅ Search by code/brand/model
- ✅ Unique code validation
- ✅ Type validation
- ✅ Status validation
- ✅ Code auto-uppercase

---

## 📝 Sample Data Included

### Suppliers (3 records)
1. TechSupply Nicaragua
2. CompuParts Central
3. Global Hardware

### Equipments (4 records)
1. PC-LAB-001 (Dell OptiPlex - Active)
2. LAP-ADM-001 (HP ProBook - Active)
3. PC-LAB-002 (Lenovo ThinkCentre - In Repair)
4. PRINT-ADM-001 (HP LaserJet - Active)

---

## 🚀 Ready for Inventory Movements

These support entities are now ready to be used in:

- **Entries Module** - Will reference suppliers for purchases
- **Outputs Module** - Will reference equipments for repairs
- **Audit Logs** - Track which equipment received which parts
- **Reports** - Generate reports by supplier, equipment, technician

The foundation is complete and follows all AGENTS.md specifications.
