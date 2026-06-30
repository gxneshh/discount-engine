/**
 * discountEngine.js
 *
 * Pure discount calculation logic. No UI, no side effects.
 * All functions take plain objects and return plain objects.
 *
 * Data shapes:
 *
 * DiscountRule {
 *   ruleId:    string       — e.g. "RULE-01"
 *   scope:     "brand" | "platform"
 *   appliesTo: string       — e.g. "Natura Casa", "Amazon India"
 *   type:      "percentage" | "flat"
 *   value:     number       — percentage as integer (15 = 15%), flat in rupees
 *   stackable: boolean
 * }
 *
 * CartItem {
 *   itemId:    string       — e.g. "ITEM-01"
 *   product:   string
 *   brand:     string
 *   platform:  string
 *   basePrice: number       — in rupees
 * }
 *
 * DiscountResult {
 *   itemId:        string
 *   product:       string
 *   brand:         string
 *   platform:      string
 *   basePrice:     number
 *   finalPrice:    number
 *   totalDiscount: number
 *   appliedRules:  string[]
 *   skippedRules:  string[]
 *   reasoning:     string   — customer-readable explanation
 * }
 */

/**
 * Returns true if the rule applies to this cart item.
 */
export function ruleMatchesItem(item, rule, subtotals = {}) {
  const normalise = (s) => (s || '').trim().toLowerCase()
  let matchesScope = false

  if (rule.scope === 'brand') {
    matchesScope = normalise(item.brand) === normalise(rule.appliesTo)
  } else if (rule.scope === 'platform') {
    matchesScope = normalise(item.platform) === normalise(rule.appliesTo)
  } else if (rule.scope === 'product') {
    matchesScope = normalise(item.product) === normalise(rule.appliesTo)
  } else if (rule.scope === 'category') {
    matchesScope = normalise(item.category) === normalise(rule.appliesTo)
  }

  if (!matchesScope) return false

  // Check Minimum Order Value if defined and greater than 0
  if (rule.minOrderValue && rule.minOrderValue > 0) {
    const scopeSubtotals = subtotals[rule.scope] || {}
    const currentSubtotal = scopeSubtotals[normalise(rule.appliesTo)] || 0
    if (currentSubtotal < rule.minOrderValue) {
      return false
    }
  }

  return true
}

/**
 * Calculates the rupee discount a rule gives on a given price.
 * Uses the provided price, not the original base price — important for stacking.
 */
export function calculateDiscountAmount(price, rule) {
  if (rule.type === 'percentage') {
    return Math.round(price * rule.value / 100)
  }
  if (rule.type === 'flat') {
    return rule.value
  }
  return 0
}

/**
 * Builds the customer-facing reasoning string for an applied rule.
 */
function ruleToReasoning(rule) {
  let scopeLabel = 'Offer'
  if (rule.scope === 'brand') scopeLabel = 'Brand'
  else if (rule.scope === 'platform') scopeLabel = 'Platform'
  else if (rule.scope === 'product') scopeLabel = 'Product'
  else if (rule.scope === 'category') scopeLabel = 'Category'

  if (rule.type === 'percentage') {
    return `${scopeLabel} offer: ${rule.value}% off`
  }
  if (rule.type === 'flat') {
    return `${scopeLabel} offer: Rs.${rule.value} off`
  }
  return `${scopeLabel} offer applied`
}

/**
 * Applies the active discount rules to a single cart item.
 * Returns a DiscountResult.
 *
 * Logic:
 *   1. Find all rules that match this item.
 *   2. Among non-stackable rules, pick the one giving the largest discount.
 *   3. Apply any stackable rules on top of that price.
 *   4. Build the reasoning string from what was applied.
 */
export function applyDiscounts(item, rules, subtotals = {}) {
  const matchingRules = rules.filter((r) => ruleMatchesItem(item, r, subtotals))

  // No rules match — return base price with explanation
  if (matchingRules.length === 0) {
    return {
      itemId: item.itemId,
      product: item.product,
      brand: item.brand,
      platform: item.platform,
      category: item.category || 'General',
      basePrice: item.basePrice,
      finalPrice: item.basePrice,
      totalDiscount: 0,
      appliedRules: [],
      skippedRules: [],
      reasoning: 'No offers available',
    }
  }

  const nonStackable = matchingRules.filter((r) => !r.stackable)
  const stackable = matchingRules.filter((r) => r.stackable)

  // Pick the non-stackable rule that gives the largest saving
  let winner = null
  let skipped = []

  if (nonStackable.length > 0) {
    const sorted = [...nonStackable].sort(
      (a, b) =>
        calculateDiscountAmount(item.basePrice, b) -
        calculateDiscountAmount(item.basePrice, a)
    )
    winner = sorted[0]
    skipped = sorted.slice(1)
  }

  // Apply winner first, then stack on top
  let price = item.basePrice
  const appliedRules = []
  const reasoningParts = []

  if (winner) {
    price -= calculateDiscountAmount(price, winner)
    appliedRules.push(winner.ruleId)
    reasoningParts.push(ruleToReasoning(winner))
  }

  for (const rule of stackable) {
    price -= calculateDiscountAmount(price, rule)
    appliedRules.push(rule.ruleId)
    reasoningParts.push(ruleToReasoning(rule))
  }

  const finalPrice = Math.round(price)

  return {
    itemId: item.itemId,
    product: item.product,
    brand: item.brand,
    platform: item.platform,
    category: item.category || 'General',
    basePrice: item.basePrice,
    finalPrice,
    totalDiscount: item.basePrice - finalPrice,
    appliedRules,
    skippedRules: skipped.map((r) => r.ruleId),
    reasoning: reasoningParts.join(' + '),
  }
}

/**
 * Runs applyDiscounts across every item in the cart.
 * Returns an array of DiscountResult objects.
 */
export function processCart(cartItems, rules) {
  const normalise = (s) => (s || '').trim().toLowerCase()

  // Compute subtotals for each scope to validate Minimum Order Values
  const subtotals = {
    brand: {},
    platform: {},
    product: {},
    category: {},
  }

  for (const item of cartItems) {
    const b = normalise(item.brand)
    const p = normalise(item.platform)
    const pr = normalise(item.product)
    const c = normalise(item.category || 'General')

    subtotals.brand[b] = (subtotals.brand[b] || 0) + item.basePrice
    subtotals.platform[p] = (subtotals.platform[p] || 0) + item.basePrice
    subtotals.product[pr] = (subtotals.product[pr] || 0) + item.basePrice
    subtotals.category[c] = (subtotals.category[c] || 0) + item.basePrice
  }

  return cartItems.map((item) => applyDiscounts(item, rules, subtotals))
}

/**
 * Sums the final prices across all results.
 */
export function cartTotal(results) {
  return results.reduce((sum, r) => sum + r.finalPrice, 0)
}
