/**
 * aiParser.js
 *
 * Simulated Natural Language Processing (NLP) / LLM parsing logic.
 * Decoupled from the core discount engine. Converts unstructured text inputs
 * (prompts, receipt text, simulated OCR output) into structured rules or cart items.
 *
 * Designed to handle errors gracefully, flag malformed rows, and prevent crashes.
 */

/**
 * Parses a natural language prompt to extract a discount rule.
 * Throws structured errors if the input is ambiguous or missing key info.
 *
 * Examples:
 * - "Add a rule: 15% off on brand Natura Casa, min spend 1000, stackable"
 * - "Create rule RULE-99: platform Amazon India flat Rs.100 off"
 */
export function parsePromptToRule(promptText) {
  if (!promptText || promptText.trim().length === 0) {
    throw new Error('Ambiguous input: The prompt is empty.')
  }

  const text = promptText.toLowerCase()

  // 1. Extract Rule ID (optional, will generate if missing)
  let ruleId = null
  const idMatch = promptText.match(/(?:rule id|rule|id)\s*([a-zA-Z0-9-]+)/i)
  if (idMatch) {
    ruleId = idMatch[1].trim().toUpperCase()
  } else {
    ruleId = `RULE-AI-${Math.floor(100 + Math.random() * 900)}`
  }

  // 2. Extract Scope and Target (Applies To)
  let scope = null
  let appliesTo = null

  const brandMatch = promptText.match(/(?:brand|by)\s+([a-zA-Z0-9\s]{2,15})(?:\s+|$|,|price|min|stack)/i)
  const platformMatch = promptText.match(/(?:platform|on)\s+(amazon india|flipkart|noon|myntra|amazon|nykaa)(?:\s+|$|,|price|min|stack)/i)
  const productMatch = promptText.match(/(?:product|item)\s+([a-zA-Z0-9\s]{2,20})(?:\s+|$|,|price|min|stack)/i)
  const categoryMatch = promptText.match(/(?:category|in)\s+([a-zA-Z0-9\s]{2,15})(?:\s+|$|,|price|min|stack)/i)

  if (brandMatch) {
    scope = 'brand'
    appliesTo = brandMatch[1].trim()
  } else if (platformMatch) {
    scope = 'platform'
    appliesTo = platformMatch[1].trim()
  } else if (productMatch) {
    scope = 'product'
    appliesTo = productMatch[1].trim()
  } else if (categoryMatch) {
    scope = 'category'
    appliesTo = categoryMatch[1].trim()
  }

  // If no scope is extracted, try matching common platforms/brands dynamically
  if (!scope) {
    if (text.includes('amazon') || text.includes('flipkart') || text.includes('noon')) {
      scope = 'platform'
      const match = promptText.match(/(amazon india|flipkart|noon|myntra|amazon)/i)
      appliesTo = match ? match[1].trim() : 'Amazon India'
    } else if (text.includes('natura casa') || text.includes('nordic basics') || text.includes('livspace')) {
      scope = 'brand'
      const match = promptText.match(/(natura casa|nordic basics|livspace pro|livspace)/i)
      appliesTo = match ? match[1].trim() : 'Natura Casa'
    } else {
      throw new Error(
        'Ambiguous input: Could not identify target scope (brand, platform, product, or category). Please specify e.g., "for brand Natura Casa".'
      )
    }
  }

  // 3. Extract Type and Value (percentage vs flat)
  let type = null
  let value = null

  // Check for percentage (e.g. "15% off", "10 percent discount")
  const pctMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)/)
  if (pctMatch) {
    type = 'percentage'
    value = parseFloat(pctMatch[1])
  } else {
    // Check for flat (e.g. "flat 150 off", "100 rupees off", "flat rs. 50")
    const flatMatch = text.match(/(?:flat\s*(?:rs\.?|rupees)?\s*|rs\.?\s*|rupees\s*)(\d+(?:\.\d+)?)/) ||
                      text.match(/(\d+(?:\.\d+)?)\s*(?:rs|rupees|flat|off)/)
    if (flatMatch) {
      type = 'flat'
      value = parseFloat(flatMatch[1])
    }
  }

  if (!type || isNaN(value) || value <= 0) {
    throw new Error(
      'Ambiguous input: Could not determine discount value or type. Please specify e.g., "15% off" or "flat Rs.100".'
    )
  }

  // 4. Extract Minimum Order Value (MOV)
  let minOrderValue = 0
  const movMatch = text.match(/(?:min spend|min order|above|spend of|over|threshold of)\s*(?:rs\.?|rupees)?\s*(\d+(?:\.\d+)?)/i)
  if (movMatch) {
    minOrderValue = parseFloat(movMatch[1])
  }

  // 5. Extract Stackability
  const stackable = text.includes('stackable') && !text.includes('non-stackable') && !text.includes('not stackable')

  return {
    ruleId,
    scope,
    appliesTo,
    type,
    value,
    stackable,
    minOrderValue,
    isActive: true,
  }
}

/**
 * Parses a natural language prompt to add or extract a cart item.
 *
 * Example:
 * - "Add item ITEM-99: Desk Lamp brand Ikea platform Amazon price 799 category Office"
 */
export function parsePromptToCartItem(promptText) {
  if (!promptText || promptText.trim().length === 0) {
    throw new Error('Ambiguous input: The prompt is empty.')
  }

  const text = promptText.toLowerCase()

  // 1. Extract Item ID
  let itemId = null
  const idMatch = promptText.match(/(?:item id|item|id)\s*([a-zA-Z0-9-]+)/i)
  if (idMatch) {
    itemId = idMatch[1].trim().toUpperCase()
  } else {
    itemId = `ITEM-AI-${Math.floor(100 + Math.random() * 900)}`
  }

  // 2. Base Price
  let basePrice = null
  const priceMatch = text.match(/(?:price|cost|worth|base price|rs\.?)\s*(\d+(?:\.\d+)?)/i)
  if (priceMatch) {
    basePrice = Math.round(parseFloat(priceMatch[1]))
  }

  if (!basePrice || isNaN(basePrice) || basePrice <= 0) {
    throw new Error('Ambiguous input: Could not identify a valid product price. Please specify e.g., "price 599".')
  }

  // 3. Product name
  let product = 'AI Product'
  const prodMatch = promptText.match(/(?:product|name|called)\s+([a-zA-Z0-9\s]{2,20})(?:\s+|$|,|brand|platform|price|category)/i)
  if (prodMatch) {
    product = prodMatch[1].trim()
  } else {
    // Try to guess first word or words as name
    const guessMatch = promptText.match(/(?:add item|item)\s+([a-zA-Z0-9\s]{2,15})(?:\s+brand|\s+price)/i)
    if (guessMatch) {
      product = guessMatch[1].trim()
    }
  }

  // 4. Brand
  let brand = 'Generic'
  const brandMatch = promptText.match(/(?:brand|maker|by)\s+([a-zA-Z0-9\s]{2,15})(?:\s+|$|,|platform|price|category)/i)
  if (brandMatch) {
    brand = brandMatch[1].trim()
  }

  // 5. Platform
  let platform = 'Direct'
  const platMatch = promptText.match(/(?:platform|store|on)\s+([a-zA-Z0-9\s]{2,15})(?:\s+|$|,|brand|price|category)/i)
  if (platMatch) {
    platform = platMatch[1].trim()
  }

  // 6. Category
  let category = 'General'
  const catMatch = promptText.match(/(?:category|in)\s+([a-zA-Z0-9\s]{2,15})(?:\s+|$|,|brand|platform|price)/i)
  if (catMatch) {
    category = catMatch[1].trim()
  }

  return {
    itemId,
    product,
    brand,
    platform,
    basePrice,
    category,
  }
}


