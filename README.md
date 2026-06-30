# Opptra Discount Engine — Enhanced Implementation & Sandbox

This is the enhanced implementation of the Opptra Discount Engine. It has been upgraded from a basic CSV runner into a fully interactive reactive sandbox, featuring live recalculations, manual data editors, a light/dark theme toggle, real-time analytics, and data exporters.

## Live Deployment
- **Deployment URL:** [Add your live deployment link here before submitting]

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## ⚡ Enhanced Sandbox Features

1. **Reactive Auto-Calculations:** The application automatically recalculates results the moment you edit rules, toggle rules, add items, or delete data. There's no need to manually click a calculate button.
2. **Interactive Rule Toggles:** You can turn individual rules on or off using active checkboxes in the rules list to simulate different pricing scenarios.
3. **Manual Entry Editors:** Quickly add custom rules and cart items via forms directly in the web dashboard without editing or re-uploading CSV files.
4. **Light & Dark Theme Toggle:** Shift between light and dark modes in the header. Your preference is persisted automatically using browser `localStorage`.
5. **Analytics Dashboard:** Visual metric cards show **Original Total**, **Total Savings (Rs & %)**, **Final Checkout Total**, and the count of **Active Rules**.
6. **Progress Savings Bars:** Visual indicators in the items table instantly display the exact percentage savings per product.
7. **CSV Exporter:** Download the final checkout summary (including applied rules, final price, and calculations) as `discount_results.csv`.

---

## Project structure

```
src/
  engine/
    discountEngine.js   ← core discount logic (subtotal aggregation, MOV checks, category/product scope)
    csvParser.js        ← CSV → typed objects (min_order_value & category fields)
  components/
    CsvUploader.jsx     ← file upload area
    DataTable.jsx       ← reusable table
    ErrorBanner.jsx     ← parse error display
  App.jsx               ← main UI + reactive sandbox state + editors + analytics
  main.jsx              ← entry point
  index.css             ← default typography configuration
changes.md              ← detailed summary of implemented features
```

---

## Extended CSV Formats

### rules.csv

| Column            | Type               | Description / Example                                           |
|-------------------|--------------------|-----------------------------------------------------------------|
| `rule_id`         | string             | e.g. `RULE-01`                                                  |
| `scope`           | brand \| platform \| product \| category | Target domain e.g. `platform`, `brand`, `category`, `product`  |
| `applies_to`      | string             | e.g. `Amazon India`, `Natura Casa`, `Bedding`, `Cushion Cover`  |
| `type`            | percentage \| flat | e.g. `percentage` or `flat`                                     |
| `value`           | number             | e.g. `15` for 15%, `150` for Rs. 150 off                        |
| `stackable`       | true \| false      | Allows stacking on top of other non-stackable offers            |
| `min_order_value` | number (optional)  | Minimum cumulative subtotal in that scope required to apply     |

### cart.csv

| Column       | Type              | Description / Example                              |
|--------------|-------------------|----------------------------------------------------|
| `item_id`    | string            | e.g. `ITEM-01`                                     |
| `product`    | string            | e.g. `Cushion Cover`                               |
| `brand`      | string            | e.g. `Natura Casa`                                 |
| `platform`   | string            | e.g. `Amazon India`                                |
| `base_price` | number            | Base price in rupees e.g. `1299`                   |
| `category`   | string (optional) | Product category e.g. `Bedding`, `Kitchen`, `Home` |

---

## Discount logic & Expected Results

- When multiple non-stackable rules match an item, the one giving the **largest saving in rupees** is applied.
- Rules marked `stackable: true` apply **on top of** the winning non-stackable rule.
- If no rules match, the base price is returned with a "No offers available" note.
- **Minimum Order Value (MOV):** Evaluates if the cumulative subtotal of all items matching the rule's scope (e.g. brand "Natura Casa") meets or exceeds the required threshold.

### Expected results for the preloaded sample data

| Item    | Base Price | Final Price | Reasoning / Offers Applied                             |
|---------|-----------|-------------|--------------------------------------------------------|
| ITEM-01 | Rs.1,299  | Rs.1,104    | Platform offer: 15% off (beats Rs.150)                 |
| ITEM-02 | Rs.849    | Rs.629      | Brand offer: Rs.150 off + Platform 10%                 |
| ITEM-03 | Rs.599    | Rs.509      | Platform offer: 15% off                                |
| ITEM-04 | Rs.2,499  | Rs.2,374    | Category offer: 5% off (Min spend >= Rs.1000 met)      |
| ITEM-05 | Rs.449    | Rs.382      | Platform offer: 15% off                                |
| ITEM-06 | Rs.899    | Rs.809      | Platform offer: 10% off                                |
