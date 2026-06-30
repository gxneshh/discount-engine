# Opptra Discount Engine — Sandbox & Feature Extensions

We have upgraded the Discount Engine with several advanced features, real-time interactive sandboxing capabilities, and automated analytics. Below is a summary of the additions and updates.

---

## 1. Engine & Parser Schema Extensions

- **Optional Minimum Order Value (MOV):** Rules can now specify a `min_order_value` (e.g. `1000` for Rs. 1,000 spend). The engine aggregates item base prices based on the rule's scope and ensures the subtotal matches or exceeds the threshold before applying it.
- **Product & Category Level Scopes:** Added support for matching discounts directly to specific product names (`product` scope) or categories (`category` scope).
- **Cart Categories:** Items in the cart can now have an optional `category` column (defaults to `"General"`).
- **CSV Parser Compatibility:** Updated [csvParser.js](file:///Users/OMEN/Desktop/price/discount-engine-assignment/src/engine/csvParser.js) to parse the new optional fields without breaking standard CSV uploads that lack these headers.

---

## 2. Interactive Rules Simulation (Sandbox)

- **Interactive Status Toggles:** Added a checkbox column in the loaded rules list. You can instantly toggle a rule's active/inactive state and see how the final calculations change.
- **Manual Input Panels:** Forms have been added directly to the dashboard to manually add custom discount rules and cart items without having to edit/upload CSV files.
- **Data Cleanup:** A "Clear All Data" action button was added to clear current sandbox data.
- **Dynamic Delete Actions:** You can now delete custom rules or items directly from the loaded lists by clicking the 🗑️ trash bin icon.
- **Reactive Live Recalculations:** Clicking calculate is no longer required! The engine recalculates checkout totals reactively on any change (e.g., when adding/deleting items or toggling active rules).

---

## 3. Premium Interactive UI & Styling

- **Light/Dark Mode Theme:** Includes a theme switcher in the header that shifts the color scheme between slate dark and clean light modes, persisting your preference across reloads in `localStorage`.
- **Tabbed Layout Navigation:** Features tab buttons to easily switch views between:
  - **⚡ Control Center:** Where CSV files are uploaded and manual items/rules are edited.
  - **🏷️ Rules List:** Highlighting rule parameters, active statuses, and deletion controls.
  - **🛒 Cart Items:** Reviewing loaded shopping inventory parameters.
- **Responsive Table CSS Injector:** Dynamically injects CSS overrides so that hover highlights, text colors, borders, and rows adapt naturally to dark or light themes.
- **Applied Rules Chips:** Rather than listing plain text, applied discount rules are rendered as beautiful inline chips.

---

## 4. Analytics Dashboard & CSV Exports

- **Stat Summary Cards:** Displays real-time calculations:
  - **Original Total:** Sum of base prices before discounts.
  - **Total Savings:** Sum of savings in Rs. and total percentage saved.
  - **Final Total:** The new final checkout subtotal.
  - **Active Rules:** Count of active rules vs total rules.
- **Progress Discount Bars:** Displays a colored progress bar in the items table showing the exact savings percentage visually.
- **CSV Exporter:** Exports the calculated item results (including applied rule IDs, final price, savings, and reasoning) as `discount_results.csv`.

---

## 5. Default Datasets

- The app is now prepopulated with standard Opptra rules and cart items out-of-the-box, allowing immediate interaction without first loading files.
