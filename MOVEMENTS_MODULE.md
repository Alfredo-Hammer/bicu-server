# Inventory Movements Module (Kardex) - Complete ✅

## Overview

The Inventory Movements module implements automatic stock control through **Entries** (purchases/additions) and **Outputs** (usage in repairs). Stock can **ONLY** be modified through these movements - manual stock editing is no longer allowed.

---

## ✅ Implementation Complete

### Database Schema

#### **entries** table
- `id` - Serial primary key
- `supplier_id` - References suppliers (required)
- `user_id` - References users (who registered the entry)
- `date` - Timestamp (auto)
- `notes` - Optional text
- `active` - Boolean (soft delete)

#### **entry_details** table
- `id` - Serial primary key
- `entry_id` - References entries (CASCADE delete)
- `spare_part_id` - References spare_parts
- `quantity` - Integer > 0
- `unit_price` - Numeric(10,2) >= 0

#### **outputs** table
- `id` - Serial primary key
- `technician_id` - References users (required)
- `equipment_id` - References equipments (required)
- `date` - Timestamp (auto)
- `notes` - Optional text
- `active` - Boolean (soft delete)

#### **output_details** table
- `id` - Serial primary key
- `output_id` - References outputs (CASCADE delete)
- `spare_part_id` - References spare_parts
- `quantity` - Integer > 0

---

## 🔐 Business Rules Enforced

### Entries (Purchases)
✅ **Increases stock automatically**
✅ **Must have supplier**
✅ **Must have at least one spare part**
✅ **Quantity must be > 0**
✅ **Unit price must be >= 0**
✅ **Validates spare part exists**

### Outputs (Usage in Repairs)
✅ **Decreases stock automatically**
✅ **Must have technician**
✅ **Must have equipment**
✅ **Must have at least one spare part**
✅ **Quantity must be > 0**
✅ **Validates sufficient stock**
✅ **Rejects if stock insufficient**

---

## 🔄 Transaction Control (CRITICAL)

Every entry and output uses **PostgreSQL transactions**:

```javascript
const client = await db.pool.connect();
try {
  await client.query('BEGIN');
  
  // Create entry/output
  // Create details
  // Update stock
  
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
```

**If ANY detail fails → ROLLBACK everything**
**No partial operations are allowed**

---

## 📡 API Endpoints

### Entries

#### Create Entry (Admin only)
```http
POST /api/entries
Authorization: Bearer <token>
Content-Type: application/json

{
  "supplier_id": 1,
  "details": [
    {
      "spare_part_id": 1,
      "quantity": 20,
      "unit_price": 16.00
    },
    {
      "spare_part_id": 2,
      "quantity": 10,
      "unit_price": 50.00
    }
  ],
  "notes": "Compra de repuestos adicionales"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Entrada registrada correctamente. Stock actualizado",
  "data": {
    "entry": { ... },
    "details": [ ... ]
  }
}
```

#### Get Entry by ID
```http
GET /api/entries/:id
Authorization: Bearer <token>
```

---

### Outputs

#### Create Output (Admin & Técnico)
```http
POST /api/outputs
Authorization: Bearer <token>
Content-Type: application/json

{
  "technician_id": 1,
  "equipment_id": 2,
  "details": [
    {
      "spare_part_id": 1,
      "quantity": 5
    },
    {
      "spare_part_id": 2,
      "quantity": 3
    }
  ],
  "notes": "Reparación de laptop administrativa"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Salida registrada correctamente. Stock actualizado",
  "data": {
    "output": { ... },
    "details": [ ... ]
  }
}
```

#### Get Output by ID
```http
GET /api/outputs/:id
Authorization: Bearer <token>
```

---

## 🛡️ Role-Based Access Control

| Endpoint | Admin | Técnico | Supervisor |
|----------|-------|---------|------------|
| POST /api/entries | ✅ | ❌ | ❌ |
| GET /api/entries/:id | ✅ | ✅ | ✅ |
| POST /api/outputs | ✅ | ✅ | ❌ |
| GET /api/outputs/:id | ✅ | ✅ | ✅ |

---

## ✅ Verified Functionality

### Test Results

#### 1. Entry Creation (Stock Increase)
```bash
# Initial stock: 63
POST /api/entries (quantity: 20)
# Result: Stock increased to 83 ✅
```

#### 2. Output Creation (Stock Decrease)
```bash
# Current stock: 83
POST /api/outputs (quantity: 5)
# Result: Stock decreased to 78 ✅
```

#### 3. Insufficient Stock Validation
```bash
# Current stock: 78
POST /api/outputs (quantity: 1000)
# Result: "Stock insuficiente para Memoria RAM DDR4 8GB. 
#          Disponible: 78, Solicitado: 1000" ✅
# Stock unchanged: 78 ✅
```

#### 4. Entry Retrieval with Details
```bash
GET /api/entries/2
# Returns: Entry with supplier, user, and all details ✅
```

---

## 📁 File Structure

```
server/src/
├── models/
│   ├── entryModel.js          ✅ Entry data access with transactions
│   └── outputModel.js         ✅ Output data access with transactions
├── services/
│   ├── entryService.js        ✅ Entry business logic + stock increase
│   └── outputService.js       ✅ Output business logic + stock validation
├── controllers/
│   ├── entryController.js     ✅ Entry HTTP handlers
│   └── outputController.js    ✅ Output HTTP handlers
├── routes/
│   ├── entryRoutes.js         ✅ Entry endpoints
│   └── outputRoutes.js        ✅ Output endpoints
└── utils/
    └── messages.js            ✅ Spanish messages for movements

database/
└── movements.sql              ✅ Schema + sample data
```

---

## 🔍 Audit Trail

Every movement stores:
- ✅ **User who created it** (`user_id` / `technician_id`)
- ✅ **Date and time** (automatic timestamp)
- ✅ **Spare parts used** (in details tables)
- ✅ **Quantities** (exact amounts)
- ✅ **Supplier** (for entries)
- ✅ **Equipment** (for outputs)
- ✅ **Notes** (optional context)

---

## 🚫 Stock Protection

**Manual stock editing is NO LONGER ALLOWED**

Stock can ONLY change through:
1. **POST /api/entries** → Increases stock
2. **POST /api/outputs** → Decreases stock

Any attempt to manually update `spare_parts.stock` should be rejected by application logic.

---

## 📊 Spanish Messages

All user-facing messages in Spanish:

**Entries:**
- "Entrada registrada correctamente. Stock actualizado"
- "El proveedor es requerido"
- "Debe incluir al menos un repuesto"
- "La cantidad debe ser mayor a cero"
- "El precio unitario debe ser mayor o igual a cero"

**Outputs:**
- "Salida registrada correctamente. Stock actualizado"
- "El técnico es requerido"
- "El equipo es requerido"
- "Stock insuficiente para {name}. Disponible: {available}, Solicitado: {requested}"

---

## 🎯 Expected Results - All Achieved

✅ **1. Register a purchase of spare parts**
- Entry created with supplier, user, date, and details
- Stock automatically increased

✅ **2. Register a repair usage**
- Output created with technician, equipment, date, and details
- Stock automatically decreased

✅ **3. Automatically update stock**
- Stock updates happen within transactions
- No manual intervention needed

✅ **4. Prevent usage when stock is insufficient**
- Validation before creating output
- Clear Spanish error message
- Transaction rolled back

✅ **5. Query movement history**
- GET /api/entries/:id returns full entry with details
- GET /api/outputs/:id returns full output with details
- Includes supplier/technician/equipment names

---

## 🔒 Data Integrity

- ✅ Foreign key constraints
- ✅ Check constraints (quantity > 0, price >= 0)
- ✅ CASCADE delete on details
- ✅ Indexes for performance
- ✅ Automatic timestamps
- ✅ Soft delete support

---

## 📝 Next Steps

The system is now ready for:
- **Reports module** - Movement history, stock reports
- **Audit logs** - Complete activity tracking
- **Dashboard** - Real-time stock visualization
- **Notifications** - Low stock alerts

---

**Status:** ✅ Complete and tested
**Compliance:** Follows AGENTS.md specifications
**Language:** Spanish (user-facing) / English (code)
**Transaction Safety:** PostgreSQL ACID transactions
**Stock Control:** Fully automatic, no manual editing
