# Products Page — ASCII Wireframe

This document defines the **wireframe-level structure** for a modern, scalable **Products page**,
designed to fully leverage **shadcn/ui** components.

Focus:
- Information hierarchy
- Interaction flow
- Enterprise-ready UX
- No styling, no code

---

## GLOBAL HEADER

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ← Dashboard   Products                                                    │
│ Manage your catalog, pricing, and inventory                     [+ Add]   │
│                                                                   ⋮        │
└────────────────────────────────────────────────────────────────────────────┘
```

- `+ Add` → Add Product
- `⋮` → Import / Export / Bulk upload

---

## PERFORMANCE OVERVIEW (KPIs)

```
┌────────────────────────────────────────────────────────────────────────────┐
│  [ Today ]  [ 7 Days ]  [ 30 Days ]  [ Custom ]                            │
│                                                                            │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ │
│ │ Total Sales   │ │ Orders        │ │ Affiliate     │ │ Discounts     │ │
│ │ $30,230       │ │ 982            │ │ $4,530        │ │ $2,230        │ │
│ │ +20.1% ↑      │ │ +5.02% ↑       │ │ +3.1% ↑       │ │ -3.58% ↓      │ │
│ └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## PRODUCT VIEWS (TABS)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ [ All Products ] [ Active ] [ Out of Stock ] [ Draft ] [ Archived ]        │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## SEARCH & FILTER BAR

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 🔍 Search products, SKU, category...                                       │
│                                                                            │
│ Filters:  [ Status ▾ ]  [ Category ▾ ]  [ Price ▾ ]  [ Rating ▾ ]         │
│ Applied:  Active  Electronics  $100–$500   ✕   ✕   ✕                      │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## BULK ACTION TOOLBAR (CONDITIONAL)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ 3 products selected                                                       │
│ [ Change Status ] [ Assign Category ] [ Update Price ] [ Delete ]          │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## PRODUCTS TABLE

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ☐  Product                         Price     Category     Stock   Status │
│                                                                            │
│ ☐  🖼 HP Pavilion 16.1"            $960.99   Electronics     5 ⚠   Active │
│     SKU: RCH45Q1A                                                           │
│                                                                            │
│ ☐  🖼 Samsung Galaxy A21s         $350.00   Electronics    25     Active │
│     SKU: MVCFH27F                                                           │
│                                                                            │
│ ☐  🖼 Ultimate Ears Speaker       $119.99   Electronics    10     Active │
│     SKU: MVCFH27F                                                           │
│                                                                            │
│ ☐  🖼 Canon Pixma TS3350           $439.50   Electronics    25     Closed │
│     SKU: MVCFH27F                                                           │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## EMPTY STATE

```
┌────────────────────────────────────────────────────────────────────────────┐
│ No products found                                                        │
│                                                                            │
│ Try adjusting filters or add your first product                           │
│                                                                            │
│ [ + Add Product ]                                                         │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## LOADING STATE (SKELETON)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ██████████   ██████████   ██████████   ██████████                          │
│ ██████████████████████████████████████████████████                        │
│ ██████████████████████████████████████████████████                        │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## PAGINATION & SUMMARY

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Showing 1–10 of 120 products                                              │
│                                                         [ Prev ] [ Next ] │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Notes

- Fully aligned with shadcn/ui components
- Designed for incremental refactoring
- Scales from MVP to enterprise catalogs
- Pairs directly with Add/Edit Product redesign
