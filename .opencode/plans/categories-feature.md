# Categories Feature - Implementation Plan

## Overview

Add the ability to categorize transactions so users can sort and filter by category to see where they spend the most money.

### Goals
- Every transaction has one category
- Users can filter transactions by category
- Users can add/edit category of a transaction (single and batch)
- System learns from user corrections

---

## Key Decisions

| Aspect | Decision |
|--------|----------|
| System categories | Copied to user on signup, user can rename/delete (except fallback) |
| Fallback category | "Uncategorized" - cannot be deleted (enforced via system link) |
| Auto-categorization | Keyword matching (multiple keywords per rule) |
| Matching priority | User rules → System rules → Uncategorized |
| Matching logic | Case-insensitive contains, longest keyword match wins |
| Learning | When user changes category, suggest creating a rule from transaction name |
| Existing transactions | Set to "Uncategorized" in migration |

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     SYSTEM (Admin-managed, Read-only)           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐       ┌─────────────────────────┐     │
│  │  system_category    │       │  system_category_rule   │     │
│  ├─────────────────────┤       ├─────────────────────────┤     │
│  │ id (PK)             │◄──────│ system_category_id (FK) │     │
│  │ name                │       │ keywords (JSON array)   │     │
│  │ icon                │       │ id (PK)                 │     │
│  │ is_default          │       │ created_at              │     │
│  │ created_at          │       └─────────────────────────┘     │
│  └─────────────────────┘                                       │
│            │                                                    │
└────────────│────────────────────────────────────────────────────┘
             │ (link preserved on copy)
             │
┌────────────│────────────────────────────────────────────────────┐
│            ▼              USER (User-managed)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐       ┌─────────────────────────┐     │
│  │  category           │       │  category_rule          │     │
│  ├─────────────────────┤       ├─────────────────────────┤     │
│  │ id (PK)             │◄──────│ category_id (FK)        │     │
│  │ user_id (FK)        │       │ keywords (JSON array)   │     │
│  │ system_category_id  │       │ user_id (FK)            │     │
│  │ name (editable)     │       │ id (PK)                 │     │
│  │ icon                │       │ created_at              │     │
│  │ color               │       └─────────────────────────┘     │
│  │ created_at          │                                       │
│  └─────────────────────┘                                       │
│            │                                                    │
│            ▼                                                    │
│  ┌─────────────────────┐                                       │
│  │  transaction        │                                       │
│  ├─────────────────────┤                                       │
│  │ id (PK)             │                                       │
│  │ category_id (FK)    │                                       │
│  │ user_id (FK)        │                                       │
│  │ group_id (FK)       │                                       │
│  │ name                │                                       │
│  │ date                │                                       │
│  │ amount              │                                       │
│  │ type                │                                       │
│  └─────────────────────┘                                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Table Definitions

#### `system_category` (Admin-managed, Read-only for users)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, autoincrement | Unique identifier |
| `name` | TEXT | NOT NULL | Category name (e.g., "Groceries") |
| `icon` | TEXT | nullable | Icon identifier for UI |
| `is_default` | BOOLEAN | NOT NULL, DEFAULT FALSE | Marks fallback category ("Uncategorized") |
| `created_at` | INTEGER | NOT NULL | Timestamp (ms) |

#### `system_category_rule` (Admin-managed, Read-only for users)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, autoincrement | Unique identifier |
| `system_category_id` | INTEGER | FK → system_category, ON DELETE CASCADE | Links to system category |
| `keywords` | TEXT | NOT NULL | JSON array of keywords (e.g., `["AH", "Albert Heijn"]`) |
| `created_at` | INTEGER | NOT NULL | Timestamp (ms) |

#### `category` (User-managed)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, autoincrement | Unique identifier |
| `user_id` | TEXT | FK → user, ON DELETE CASCADE, NOT NULL | Owner |
| `system_category_id` | INTEGER | FK → system_category, ON DELETE SET NULL, nullable | Link to system template |
| `name` | TEXT | NOT NULL | Category name (user can edit) |
| `icon` | TEXT | nullable | Icon identifier |
| `color` | TEXT | nullable | Hex color code |
| `created_at` | INTEGER | NOT NULL | Timestamp (ms) |

#### `category_rule` (User-managed)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PK, autoincrement | Unique identifier |
| `user_id` | TEXT | FK → user, ON DELETE CASCADE, NOT NULL | Owner |
| `category_id` | INTEGER | FK → category, ON DELETE CASCADE, NOT NULL | Target category |
| `keywords` | TEXT | NOT NULL | JSON array of keywords |
| `created_at` | INTEGER | NOT NULL | Timestamp (ms) |

#### `transaction` (Updated)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `category_id` | INTEGER | FK → category, nullable | **NEW**: Links to user's category |

---

## Seed Data

### System Categories

| id | name | icon | is_default |
|----|------|------|------------|
| 1 | Groceries | shopping-cart | false |
| 2 | Utilities | zap | false |
| 3 | Mortgage/Rent | home | false |
| 4 | Income | dollar-sign | false |
| 5 | Dining Out | utensils | false |
| 6 | Uncategorized | help-circle | true |

### System Rules (Dutch Keywords)

| system_category_id | keywords |
|--------------------|----------|
| 1 (Groceries) | `["Albert Heijn", "AH ", "AH To Go", "Jumbo", "Lidl", "Aldi", "Plus", "Dirk", "Coop", "Spar", "Deka", "Vomar", "Hoogvliet", "Picnic", "Crisp", "Ekoplaza"]` |
| 2 (Utilities) | `["Vattenfall", "Eneco", "Essent", "Greenchoice", "Budget Energie", "Ziggo", "KPN", "T-Mobile", "Vodafone", "Ben", "Simyo", "Waternet", "PWN", "Dunea", "Evides", "Gemeente", "Belasting"]` |
| 3 (Mortgage/Rent) | `["Hypotheek", "Mortgage", "Huur", "Rent", "Woningcorporatie", "Vesteda", "Bouwinvest"]` |
| 4 (Income) | `["Salaris", "Salary", "Loon", "Wages", "Belastingdienst Toeslagen", "DUO", "UWV", "Dividend", "Interest"]` |
| 5 (Dining Out) | `["Thuisbezorgd", "Uber Eats", "Deliveroo", "Just Eat", "McDonald", "Burger King", "KFC", "Domino", "New York Pizza", "Subway", "Starbucks", "Restaurant", "Cafe", "Eetcafe"]` |

---

## Access Control

| Table | Users Can | Admin Can |
|-------|-----------|-----------|
| `system_category` | Read only | CRUD |
| `system_category_rule` | Read only | CRUD |
| `category` | CRUD (own), except linked to `is_default=true` | N/A |
| `category_rule` | CRUD (own) | N/A |

### Deletion Protection

A user category **cannot be deleted** if it's linked to a system category with `is_default=true`:

```typescript
async function deleteCategory(categoryId: number) {
  const category = await getCategory(categoryId);
  
  if (category.systemCategoryId) {
    const systemCategory = await getSystemCategory(category.systemCategoryId);
    if (systemCategory.isDefault) {
      throw new Error("Cannot delete the fallback category");
    }
  }
  
  await delete(categoryId);
}
```

---

## Categorization Logic

### Priority Order

```
1. User Rules       → Match by categoryId (user's specific rules)
2. System Rules     → Match by systemCategoryId → lookup user's linked category
3. "Uncategorized"  → Default fallback (system category with is_default=true)
```

### Matching Algorithm

```typescript
function categorizeTransaction(userId: string, transactionName: string): Effect<number> {
  const name = transactionName.toLowerCase();
  
  // 1. Get user rules, sorted by longest total keyword length (most specific first)
  const userRules = getUserRules(userId).sort(byLongestKeyword);
  
  for (const rule of userRules) {
    // Escape special regex chars, join with OR, case-insensitive
    const pattern = new RegExp(
      rule.keywords.map(escapeRegex).join("|"), 
      "i"
    );
    if (pattern.test(name)) {
      return rule.categoryId;
    }
  }
  
  // 2. Check system rules (sorted by longest keyword)
  const systemRules = getSystemRules().sort(byLongestKeyword);
  
  for (const systemRule of systemRules) {
    const pattern = new RegExp(
      systemRule.keywords.map(escapeRegex).join("|"), 
      "i"
    );
    if (pattern.test(name)) {
      // Find user's category linked to this system category
      const userCategory = getUserCategoryBySystemCategoryId(
        userId, 
        systemRule.systemCategoryId
      );
      if (userCategory) {
        return userCategory.id;
      }
    }
  }
  
  // 3. Fallback to user's Uncategorized category
  return getUncategorizedCategoryId(userId);
}

function byLongestKeyword(a: Rule, b: Rule): number {
  const aMax = Math.max(...a.keywords.map(k => k.length));
  const bMax = Math.max(...b.keywords.map(k => k.length));
  return bMax - aMax; // Descending (longest first)
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
```

---

## Learning from User Corrections

When a user manually changes a transaction's category, extract potential keywords and suggest creating a rule.

### Keyword Extraction

```typescript
function extractKeywords(transactionName: string): string[] {
  const words = transactionName.trim().split(/\s+/);
  const suggestions: string[] = [];
  
  // Progressively longer prefixes (most specific first)
  for (let i = Math.min(3, words.length); i >= 1; i--) {
    suggestions.push(words.slice(0, i).join(" "));
  }
  
  return [...new Set(suggestions)]; // Deduplicate
}

// Example:
// "AH To Go Amsterdam CS" → ["AH To Go", "AH To", "AH"]
```

### Server Action

```typescript
async function updateTransactionCategoryWithLearning(
  transactionId: number,
  categoryId: number,
  createRule?: { keywords: string[] }
): Promise<{ suggestedKeywords?: string[] }> {
  // 1. Update the transaction's category
  await updateTransactionCategory(transactionId, categoryId);
  
  // 2. If user provided keywords, create a rule
  if (createRule) {
    await createCategoryRule(categoryId, createRule.keywords);
    return {};
  }
  
  // 3. Otherwise, suggest keywords for the user to confirm
  const transaction = await getTransaction(transactionId);
  const suggestedKeywords = extractKeywords(transaction.name);
  
  return { suggestedKeywords };
}
```

---

## User Onboarding Flow

When a user first interacts with categories (e.g., uploads CSV):

```typescript
async function ensureUserHasCategories(userId: string): Promise<void> {
  const existingCategories = await getCategories(userId);
  
  if (existingCategories.length === 0) {
    // Copy all system categories to user
    const systemCategories = await getSystemCategories();
    
    for (const sysCategory of systemCategories) {
      await createCategory({
        userId,
        systemCategoryId: sysCategory.id,
        name: sysCategory.name,
        icon: sysCategory.icon,
      });
    }
  }
}
```

---

## CSV Parsing Integration

Update the CSV parsing flow to categorize transactions during import:

```
CSV File 
    ↓
Parse Records (csv-parse)
    ↓
Filter (exclude Spaarrekening)
    ↓
Transform to Transaction objects (without id, without categoryId)
    ↓
For each transaction:
    → Apply categorization logic
    → Assign categoryId
    ↓
Insert transactions with categoryId
```

---

## File Structure

### New Files

```
app/lib/categories/
├── schema.ts                 # Effect schemas: SystemCategory, SystemCategoryRule, Category, CategoryRule
├── repository.ts             # User category CRUD + seedFromSystem() + getBySystemCategoryId()
├── rule-repository.ts        # User rule CRUD
├── system-repository.ts      # Read-only: getSystemCategories(), getSystemRules()
├── service.ts                # categorizeTransaction(), ensureUserHasCategories(), extractKeywords()
├── runtime.ts                # Effect runtime for category domain
└── index.ts                  # Exports

app/lib/database/schemas/
├── system-category-schema.ts       # Drizzle schema
├── system-category-rule-schema.ts  # Drizzle schema
├── category-schema.ts              # Drizzle schema
└── category-rule-schema.ts         # Drizzle schema

app/actions/
├── category.ts              # User category CRUD actions
└── category-rule.ts         # User rule CRUD actions

drizzle/
└── XXXX_add_categories.sql  # Migration + seed data
```

### Modified Files

```
app/lib/database/schemas/
└── transaction-schema.ts    # Add categoryId column

app/lib/database/
└── index.ts                 # Export new schemas

app/lib/transactions/
├── schema.ts                # Add categoryId to Transaction class
└── repository.ts            # Add filtering by category

app/lib/csv/
└── parser.ts                # Integrate categorization during parsing

app/actions/
└── csv.ts                   # Call ensureUserHasCategories() before parsing
```

---

## Implementation Phases

### Phase 1: Database Schema & Migrations

1. Create `app/lib/database/schemas/system-category-schema.ts`
2. Create `app/lib/database/schemas/system-category-rule-schema.ts`
3. Create `app/lib/database/schemas/category-schema.ts`
4. Create `app/lib/database/schemas/category-rule-schema.ts`
5. Update `app/lib/database/schemas/transaction-schema.ts` (add categoryId)
6. Update `app/lib/database/index.ts` (export new schemas)
7. Generate migration with `bun drizzle-kit generate`
8. Add seed data to migration SQL
9. Run migration with `bun drizzle-kit migrate`

### Phase 2: Effect-TS Domain Layer

1. Create `app/lib/categories/schema.ts` (Effect schemas)
2. Create `app/lib/categories/system-repository.ts` (read-only)
3. Create `app/lib/categories/repository.ts` (user categories)
4. Create `app/lib/categories/rule-repository.ts` (user rules)
5. Create `app/lib/categories/service.ts` (categorization logic)
6. Create `app/lib/categories/runtime.ts`
7. Create `app/lib/categories/index.ts`

### Phase 3: Server Actions

1. Create `app/actions/category.ts`
   - `createCategory(name, icon?, color?)`
   - `getCategories()`
   - `updateCategory(id, { name?, icon?, color? })`
   - `deleteCategory(id)` - with protection check
2. Create `app/actions/category-rule.ts`
   - `createRule(categoryId, keywords[])`
   - `getRules()`
   - `getRulesForCategory(categoryId)`
   - `updateRule(id, keywords[])`
   - `deleteRule(id)`

### Phase 4: Transaction Integration

1. Update `app/lib/transactions/schema.ts` (add categoryId)
2. Update `app/lib/transactions/repository.ts` (filtering by category)
3. Create/update transaction actions:
   - `updateTransactionCategory(transactionId, categoryId)`
   - `updateTransactionCategoriesBatch(transactionIds[], categoryId)`
   - `suggestKeywordsForTransaction(transactionId)`

### Phase 5: CSV Parser Integration

1. Update `app/lib/csv/parser.ts`
   - Import categorization service
   - Apply categorization to each transaction before insert
2. Update `app/actions/csv.ts`
   - Call `ensureUserHasCategories()` before parsing

### Phase 6: Migration for Existing Data

1. Update migration to set all existing transactions' `category_id` to user's "Uncategorized"
   - This requires a post-seed script since we need user categories to exist first
   - Alternative: Allow `category_id = NULL` temporarily, run a one-time script

---

## Future Enhancements (Out of Scope for MVP)

| Feature | Description | Complexity |
|---------|-------------|------------|
| Global Pattern Learning | Aggregate anonymized patterns across users | Medium |
| AI/LLM Categorization | Use LLM to suggest categories for unknown transactions | Medium-Hard |
| Category Statistics | Pie chart showing spending breakdown by category | Medium |
| Admin Panel | UI for managing system categories and rules | Medium |
| Import/Export Rules | Allow users to share rule sets | Easy |

---

## Open Questions

1. **Migration strategy for existing transactions**: Should we:
   - Run a script after migration to assign "Uncategorized" to all existing transactions?
   - Or allow `category_id = NULL` and handle it in code?

2. **UI for keyword suggestions**: When user changes category, how should we present keyword suggestions? (Modal, toast, inline?)

3. **Batch categorization UI**: How should multi-select + category assignment work in the transactions list?
