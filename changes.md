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

## 5. Clean Sandbox State

- The app now initializes with clean, empty states for both rules and cart items, giving the user full control to build their dashboard from scratch by uploading CSVs or entering inputs manually.

---

## 6. AI NLP Command Parser (Tasks 1 & 2)

- **AI Prompt Assistant:** Parses unstructured prompt commands into rules or cart items in real-time. Matches target attributes (scope, appliesTo, discount type, values, min spend threshold, and stackability) dynamically.
- **AI Verification & Confirmation Modal:** Renders the parsed rule/item details inside a modal for user confirmation before inserting them into state.
- **Interactive Verification Edits:** Users can manually edit the parsed properties directly inside the modal to rectify parsing errors.
- **Semantic Validation Indicators:** The confirmation screen runs real-time checks to prevent bad data entry (e.g. flagging negative prices, duplicate IDs, or percentage values exceeding 100%). It disables the "Confirm" action if blocker errors are detected.

