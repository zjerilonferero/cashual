# Database Schema

## Overview

```
user
  │
  ▼
transaction_group
  │
  ▼
transaction ◄── user
```

## Tables

### Core Domain

| Table | Description |
|-------|-------------|
| `user` | Application users |
| `transaction_group` | Groups of transactions (e.g., CSV import batch) |
| `transaction` | Individual financial transactions |

### Auth (Better-Auth)

| Table | Description |
|-------|-------------|
| `session` | User sessions |
| `account` | OAuth/credential accounts |
| `verification` | Email verification tokens |

## Relationships

| Parent | Child | Relationship | On Delete |
|--------|-------|--------------|-----------|
| `user` | `transaction_group` | 1:N | CASCADE |
| `user` | `transaction` | 1:N | CASCADE |
| `user` | `session` | 1:N | CASCADE |
| `user` | `account` | 1:N | CASCADE |
| `transaction_group` | `transaction` | 1:N | CASCADE |

## Schema Definitions

Located in `app/lib/database/schemas/`:

- `auth-schema.ts` - user, session, account, verification
- `transaction-group-schema.ts` - transaction_group
- `transaction-schema.ts` - transaction
