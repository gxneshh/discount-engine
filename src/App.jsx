/**
 * App.jsx
 *
 * Top-level component. Manages state for rules, cart items, and results.
 * Wires together CSV upload → parse → engine → display.
 * Includes interactive rules simulation, custom data editors, analytics, and CSV exports.
 */

import { useState, useEffect } from 'react'
import CsvUploader from './components/CsvUploader.jsx'
import DataTable from './components/DataTable.jsx'
import ErrorBanner from './components/ErrorBanner.jsx'
import { parseRulesCSV, parseCartCSV } from './engine/csvParser.js'
import { processCart, cartTotal } from './engine/discountEngine.js'

// ── Default Mock Data (Enables instant play & testing) ───────────────────────

const DEFAULT_RULES = [
  { ruleId: 'RULE-01', scope: 'platform', appliesTo: 'Amazon India', type: 'percentage', value: 15, stackable: false, minOrderValue: 0, isActive: true },
  { ruleId: 'RULE-02', scope: 'brand', appliesTo: 'Natura Casa', type: 'flat', value: 150, stackable: false, minOrderValue: 0, isActive: true },
  { ruleId: 'RULE-03', scope: 'platform', appliesTo: 'Flipkart', type: 'percentage', value: 10, stackable: true, minOrderValue: 0, isActive: true },
  { ruleId: 'RULE-04', scope: 'category', appliesTo: 'Home Decor', type: 'percentage', value: 5, stackable: true, minOrderValue: 1000, isActive: true },
]

const DEFAULT_CART = [
  { itemId: 'ITEM-01', product: 'Cushion Cover', brand: 'Natura Casa', platform: 'Amazon India', basePrice: 1299, category: 'Home Decor' },
  { itemId: 'ITEM-02', product: 'Bed Sheet Set', brand: 'Natura Casa', platform: 'Flipkart', basePrice: 849, category: 'Bedding' },
  { itemId: 'ITEM-03', product: 'Wall Shelf', brand: 'LivSpace Pro', platform: 'Amazon India', basePrice: 599, category: 'Home Decor' },
  { itemId: 'ITEM-04', product: 'Ceramic Vase', brand: 'LivSpace Pro', platform: 'Noon', basePrice: 2499, category: 'Home Decor' },
  { itemId: 'ITEM-05', product: 'Cutting Board', brand: 'Nordic Basics', platform: 'Amazon India', basePrice: 449, category: 'Kitchen' },
  { itemId: 'ITEM-06', product: 'Desk Organiser', brand: 'Nordic Basics', platform: 'Flipkart', basePrice: 899, category: 'Office' },
]

// ── Style Theme Generator ───────────────────────────────────────────────────

const getTheme = (darkMode) => ({
  page: {
    minHeight: '100vh',
    background: darkMode ? '#0b0f19' : '#f8fafc',
    color: darkMode ? '#f1f5f9' : '#0f172a',
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
  header: {
    background: darkMode ? '#111827' : '#0f172a',
    padding: '0.95rem 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    boxShadow: '0 4px 12px -1px rgb(0 0 0 / 0.15)',
    transition: 'background-color 0.3s ease',
  },
  logoTxt: {
    fontSize: 20,
    fontWeight: 800,
    color: '#fff',
    letterSpacing: '-0.03em',
  },
  logoSpan: {
    color: '#6366f1',
  },
  headerSub: {
    fontSize: 10,
    color: '#818cf8',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    background: 'rgba(99, 102, 241, 0.15)',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: 700,
  },
  main: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '2rem 1.5rem',
  },
  card: {
    background: darkMode ? '#1f2937' : '#ffffff',
    border: darkMode ? '1px solid #374151' : '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: darkMode ? '0 10px 20px -3px rgb(0 0 0 / 0.35)' : '0 10px 20px -3px rgb(0 0 0 / 0.04)',
    transition: 'background-color 0.3s, border-color 0.3s, box-shadow 0.3s',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: darkMode ? '#f1f5f9' : '#0f172a',
    marginBottom: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  grid2: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    marginBottom: '1rem',
  },
  btnPrimary: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '0.65rem 1.25rem',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
  },
  btnDanger: {
    background: '#ef4444',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '0.65rem 1.25rem',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  btnSecondary: {
    background: 'none',
    color: darkMode ? '#9ca3af' : '#4b5563',
    border: darkMode ? '1px solid #374151' : '1px solid #d1d5db',
    borderRadius: 6,
    padding: '0.65rem 1.25rem',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  input: {
    width: '100%',
    padding: '0.55rem 0.75rem',
    fontSize: 13,
    background: darkMode ? '#111827' : '#ffffff',
    color: darkMode ? '#f1f5f9' : '#0f172a',
    border: darkMode ? '1px solid #374151' : '1px solid #cbd5e1',
    borderRadius: 6,
    boxSizing: 'border-box',
    marginBottom: '0.75rem',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    outline: 'none',
  },
  label: {
    fontSize: 11,
    fontWeight: 600,
    color: darkMode ? '#9ca3af' : '#4b5563',
    display: 'block',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  formBtn: {
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '0.6rem 1rem',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
    textTransform: 'uppercase',
    marginTop: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)',
    transition: 'all 0.2s',
  },
  tabBtn: (active) => ({
    background: active ? 'rgba(99, 102, 241, 0.15)' : 'none',
    color: active ? '#818cf8' : (darkMode ? '#9ca3af' : '#4b5563'),
    border: active ? '1px solid #818cf8' : '1px solid transparent',
    borderRadius: 6,
    padding: '0.5rem 1rem',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    marginRight: '0.5rem',
    transition: 'all 0.2s',
  }),
})

// ── Component ───────────────────────────────────────────────────────────────

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('opptra_theme') === 'dark'
  })

  const [activeTab, setActiveTab]         = useState('sandbox')
  const [rules, setRules]                 = useState(DEFAULT_RULES)
  const [rulesErrors, setRulesErr]        = useState([])
  const [rulesFileName, setRulesFileName] = useState('preloaded_defaults')

  const [cartItems, setCartItems]         = useState(DEFAULT_CART)
  const [cartErrors, setCartErrors]       = useState([])
  const [cartFileName, setCartFileName]   = useState('preloaded_defaults')

  const [results, setResults]             = useState(null)

  // ── Manual Input Form States ──
  const [newRuleId, setNewRuleId]         = useState('')
  const [newRuleScope, setNewRuleScope]   = useState('brand')
  const [newRuleAppliesTo, setNewRuleAppliesTo] = useState('')
  const [newRuleType, setNewRuleType]     = useState('percentage')
  const [newRuleValue, setNewRuleValue]   = useState('')
  const [newRuleStackable, setNewRuleStackable] = useState(false)
  const [newRuleMinOrderValue, setNewRuleMinOrderValue] = useState('')

  const [newItemId, setNewItemId]         = useState('')
  const [newItemProduct, setNewItemProduct] = useState('')
  const [newItemBrand, setNewItemBrand]   = useState('')
  const [newItemPlatform, setNewItemPlatform] = useState('')
  const [newItemBasePrice, setNewItemBasePrice] = useState('')
  const [newItemCategory, setNewItemCategory] = useState('')

  // ── Sync dark mode preferences ──
  useEffect(() => {
    localStorage.setItem('opptra_theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // ── Reactive Auto-Calculations: run processCart whenever rules or items change ──
  useEffect(() => {
    if (rules.length > 0 && cartItems.length > 0) {
      const activeRules = rules.filter((r) => r.isActive)
      const res = processCart(cartItems, activeRules)
      setResults(res)
    } else {
      setResults(null)
    }
  }, [rules, cartItems])

  // ── Event Handlers ──

  function handleRulesLoad(csvText, fileName) {
    const { data, errors } = parseRulesCSV(csvText)
    const formattedData = data.map((r) => ({ ...r, isActive: true }))
    setRules(formattedData)
    setRulesErr(errors)
    setRulesFileName(fileName)
  }

  function handleCartLoad(csvText, fileName) {
    const { data, errors } = parseCartCSV(csvText)
    setCartItems(data)
    setCartErrors(errors)
    setCartFileName(fileName)
  }

  function toggleRule(ruleId) {
    setRules((prev) =>
      prev.map((r) => (r.ruleId === ruleId ? { ...r, isActive: !r.isActive } : r))
    )
  }

  function deleteRule(ruleId) {
    setRules((prev) => prev.filter((r) => r.ruleId !== ruleId))
  }

  function deleteCartItem(itemId) {
    setCartItems((prev) => prev.filter((item) => item.itemId !== itemId))
  }

  function handleClearAll() {
    setRules([])
    setRulesErr([])
    setRulesFileName('')
    setCartItems([])
    setCartErrors([])
    setCartFileName('')
  }

  function handleResetDefaults() {
    setRules(DEFAULT_RULES)
    setRulesFileName('preloaded_defaults')
    setCartItems(DEFAULT_CART)
    setCartFileName('preloaded_defaults')
  }

  // ── Manual Addition Handlers ──

  function handleAddRule(e) {
    e.preventDefault()
    if (!newRuleId || !newRuleAppliesTo || !newRuleValue) {
      alert('Please fill in Rule ID, Applies To, and Value')
      return
    }
    const val = parseFloat(newRuleValue)
    const mov = parseFloat(newRuleMinOrderValue) || 0
    if (isNaN(val) || val <= 0) {
      alert('Value must be a positive number')
      return
    }
    if (isNaN(mov) || mov < 0) {
      alert('Minimum Spend must be non-negative')
      return
    }

    if (rules.some((r) => r.ruleId.toLowerCase() === newRuleId.trim().toLowerCase())) {
      alert('Rule ID already exists!')
      return
    }

    const rule = {
      ruleId: newRuleId.trim().toUpperCase(),
      scope: newRuleScope,
      appliesTo: newRuleAppliesTo.trim(),
      type: newRuleType,
      value: val,
      stackable: newRuleStackable,
      minOrderValue: mov,
      isActive: true,
    }

    setRules((prev) => [...prev, rule])
    setNewRuleId('')
    setNewRuleAppliesTo('')
    setNewRuleValue('')
    setNewRuleMinOrderValue('')
  }

  function handleAddItem(e) {
    e.preventDefault()
    if (!newItemId || !newItemProduct || !newItemBrand || !newItemPlatform || !newItemBasePrice) {
      alert('Please fill in Item ID, Product, Brand, Platform, and Base Price')
      return
    }
    const price = parseFloat(newItemBasePrice)
    if (isNaN(price) || price <= 0) {
      alert('Base Price must be a positive number')
      return
    }

    if (cartItems.some((item) => item.itemId.toLowerCase() === newItemId.trim().toLowerCase())) {
      alert('Item ID already exists!')
      return
    }

    const item = {
      itemId: newItemId.trim().toUpperCase(),
      product: newItemProduct.trim(),
      brand: newItemBrand.trim(),
      platform: newItemPlatform.trim(),
      basePrice: Math.round(price),
      category: newItemCategory.trim() || 'General',
    }

    setCartItems((prev) => [...prev, item])
    setNewItemId('')
    setNewItemProduct('')
    setNewItemBrand('')
    setNewItemPlatform('')
    setNewItemBasePrice('')
    setNewItemCategory('')
  }

  // ── CSV Export Handler ──

  function handleExportCSV() {
    if (!results || results.length === 0) return

    const headers = ['item_id', 'product', 'brand', 'platform', 'category', 'base_price', 'final_price', 'total_discount', 'applied_rules', 'reasoning']
    const csvRows = [
      headers.join(','),
      ...results.map((r) => {
        const applied = `"${(r.appliedRules || []).join(', ')}"`
        const reason = `"${(r.reasoning || '').replace(/"/g, '""')}"`
        return [
          r.itemId,
          `"${r.product.replace(/"/g, '""')}"`,
          `"${r.brand.replace(/"/g, '""')}"`,
          `"${r.platform.replace(/"/g, '""')}"`,
          `"${(r.category || 'General').replace(/"/g, '""')}"`,
          r.basePrice,
          r.finalPrice,
          r.totalDiscount,
          applied,
          reason
        ].join(',')
      })
    ]

    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', 'discount_results.csv')
    link.click()
  }

  // ── Custom Column Definitions ──

  const rulesColumns = [
    {
      key: 'isActive',
      label: 'Active',
      render: (v, row) => (
        <input
          type="checkbox"
          checked={!!v}
          onChange={() => toggleRule(row.ruleId)}
          style={{ cursor: 'pointer', width: 16, height: 16 }}
        />
      ),
    },
    { key: 'ruleId',    label: 'Rule ID' },
    { key: 'scope',     label: 'Scope',      render: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
    { key: 'appliesTo', label: 'Applies To' },
    { key: 'type',      label: 'Type',       render: (v) => v.charAt(0).toUpperCase() + v.slice(1) },
    {
      key: 'value',
      label: 'Value',
      render: (v, row) => row.type === 'percentage' ? `${v}% off` : `Rs.${v} off`,
    },
    {
      key: 'minOrderValue',
      label: 'Min Spend',
      render: (v) => (v && v > 0 ? `Rs.${v.toLocaleString('en-IN')}` : '—'),
    },
    { key: 'stackable', label: 'Stackable',  render: (v) => (v ? 'Yes' : 'No') },
    {
      key: 'ruleId',
      label: 'Actions',
      render: (v) => (
        <button
          onClick={() => deleteRule(v)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}
          title="Delete Rule"
        >
          🗑️
        </button>
      )
    }
  ]

  const cartColumns = [
    { key: 'itemId',    label: 'Item ID' },
    { key: 'product',   label: 'Product' },
    { key: 'brand',     label: 'Brand' },
    { key: 'platform',  label: 'Platform' },
    { key: 'category',  label: 'Category' },
    { key: 'basePrice', label: 'Base Price', render: (v) => `Rs.${v.toLocaleString('en-IN')}` },
    {
      key: 'itemId',
      label: 'Actions',
      render: (v) => (
        <button
          onClick={() => deleteCartItem(v)}
          style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 13 }}
          title="Delete Item"
        >
          🗑️
        </button>
      )
    }
  ]

  const resultsColumns = [
    { key: 'itemId',    label: 'Item ID' },
    { key: 'product',   label: 'Product' },
    { key: 'category',  label: 'Category' },
    { key: 'basePrice', label: 'Base Price',  render: (v) => `Rs.${v.toLocaleString('en-IN')}` },
    { key: 'finalPrice',label: 'Final Price',
      render: (v, row) => (
        <span style={{ fontWeight: 700, color: row.totalDiscount > 0 ? '#10b981' : (darkMode ? '#f1f5f9' : '#0f172a') }}>
          Rs.{v.toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'totalDiscount',
      label: 'You Save',
      render: (v, row) => {
        const discountPct = row.basePrice > 0 ? Math.round((v / row.basePrice) * 100) : 0
        return v > 0 ? (
          <div style={{ minWidth: 110 }}>
            <span style={{ color: '#10b981', fontWeight: 700, fontSize: 11 }}>Rs.{v.toLocaleString('en-IN')} ({discountPct}%)</span>
            <div style={{ width: '100%', height: 6, background: darkMode ? '#374151' : '#e2e8f0', borderRadius: 3, marginTop: 4, overflow: 'hidden' }}>
              <div style={{ width: `${discountPct}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #34d399)', borderRadius: 3 }} />
            </div>
          </div>
        ) : (
          <span style={{ color: '#888' }}>—</span>
        )
      },
    },
    {
      key: 'reasoning',
      label: 'Offers Applied',
      render: (v) => {
        if (v === 'No offers available') {
          return <span style={{ color: '#6b7280', fontStyle: 'italic', fontSize: 11 }}>No offers matching</span>
        }
        return (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {v.split(' + ').map((part, idx) => (
              <span
                key={idx}
                style={{
                  background: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  padding: '2px 8px',
                  borderRadius: 4,
                  fontSize: 10,
                  fontWeight: 600,
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                }}
              >
                {part}
              </span>
            ))}
          </div>
        )
      },
    },
  ]

  // ── Metrics Calculations ──
  const totalOriginal = results ? results.reduce((sum, r) => sum + r.basePrice, 0) : 0
  const totalFinal = results ? cartTotal(results) : 0
  const totalSavings = results ? totalOriginal - totalFinal : 0
  const savingsPct = totalOriginal > 0 ? Math.round((totalSavings / totalOriginal) * 100) : 0
  const activeRulesCount = rules.filter((r) => r.isActive).length

  const theme = getTheme(darkMode)

  return (
    <div style={theme.page}>
      {/* Dynamic CSS Overrides Injector */}
      <style>{`
        table {
          border-collapse: collapse !important;
          width: 100%;
        }
        th {
          background-color: ${darkMode ? '#111827' : '#0f172a'} !important;
          color: #ffffff !important;
          border-bottom: 2px solid ${darkMode ? '#374151' : '#e2e8f0'} !important;
          padding: 10px 14px !important;
          font-size: 11px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.06em !important;
        }
        td {
          padding: 10px 14px !important;
          color: ${darkMode ? '#e2e8f0' : '#334155'} !important;
          border-bottom: 1px solid ${darkMode ? '#374151' : '#f1f5f9'} !important;
          font-size: 12px !important;
          vertical-align: middle !important;
        }
        tr {
          background-color: ${darkMode ? '#1f2937' : '#ffffff'} !important;
          transition: background-color 0.15s ease !important;
        }
        tr:hover {
          background-color: ${darkMode ? '#2d3748' : '#f8fafc'} !important;
        }
        input:focus, select:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
        }
      `}</style>

      {/* Header */}
      <div style={theme.header}>
        <div style={theme.logoTxt}>
          O<span style={theme.logoSpan}>pp</span>tra
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={theme.headerSub}>Reactive Sandboxing</div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 18,
              cursor: 'pointer',
              outline: 'none',
            }}
            title="Toggle Light/Dark Theme"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      <div style={theme.main}>
        {/* Navigation Tabs and Global Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <button style={theme.tabBtn(activeTab === 'sandbox')} onClick={() => setActiveTab('sandbox')}>
              ⚡ Control Center
            </button>
            <button style={theme.tabBtn(activeTab === 'rules')} onClick={() => setActiveTab('rules')}>
              🏷️ Rules List ({rules.length})
            </button>
            <button style={theme.tabBtn(activeTab === 'cart')} onClick={() => setActiveTab('cart')}>
              🛒 Cart Items ({cartItems.length})
            </button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button style={theme.btnSecondary} onClick={handleResetDefaults}>
              Reset Defaults
            </button>
            {(rules.length > 0 || cartItems.length > 0) && (
              <button style={theme.btnDanger} onClick={handleClearAll}>
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Tab 1: Control Center (CSV Uploads + Forms) */}
        {activeTab === 'sandbox' && (
          <div>
            {/* Upload Row */}
            <div style={theme.grid2}>
              {/* Rules uploader */}
              <div style={theme.card}>
                <div style={theme.cardTitle}>📂 Upload Rules CSV</div>
                <CsvUploader
                  label="rules.csv"
                  description="Load rules from a local CSV file"
                  onLoad={handleRulesLoad}
                  hasData={rules.length > 0}
                  fileName={rulesFileName}
                />
                <ErrorBanner errors={rulesErrors} />
              </div>

              {/* Cart uploader */}
              <div style={theme.card}>
                <div style={theme.cardTitle}>📂 Upload Cart CSV</div>
                <CsvUploader
                  label="cart.csv"
                  description="Load items from a local CSV file"
                  onLoad={handleCartLoad}
                  hasData={cartItems.length > 0}
                  fileName={cartFileName}
                />
                <ErrorBanner errors={cartErrors} />
              </div>
            </div>

            {/* Manual Forms Row */}
            <div style={theme.card}>
              <div style={theme.cardTitle}>✍️ Quick Editor (Manual Additions)</div>
              <div style={theme.grid2}>
                {/* Rules Form */}
                <form onSubmit={handleAddRule} style={{ borderRight: darkMode ? '1px solid #374151' : '1px solid #e2e8f0', paddingRight: '1.5rem' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#6366f1', marginBottom: 12 }}>+ Custom Discount Rule</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={theme.label}>Rule ID</label>
                      <input style={theme.input} type="text" placeholder="RULE-05" value={newRuleId} onChange={(e) => setNewRuleId(e.target.value)} required />
                    </div>
                    <div>
                      <label style={theme.label}>Scope</label>
                      <select style={theme.input} value={newRuleScope} onChange={(e) => setNewRuleScope(e.target.value)}>
                        <option value="brand">Brand</option>
                        <option value="platform">Platform</option>
                        <option value="product">Product</option>
                        <option value="category">Category</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={theme.label}>Applies To</label>
                      <input style={theme.input} type="text" placeholder="Natura Casa" value={newRuleAppliesTo} onChange={(e) => setNewRuleAppliesTo(e.target.value)} required />
                    </div>
                    <div>
                      <label style={theme.label}>Discount Type</label>
                      <select style={theme.input} value={newRuleType} onChange={(e) => setNewRuleType(e.target.value)}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="flat">Flat Price (Rs)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', alignItems: 'center' }}>
                    <div>
                      <label style={theme.label}>Value</label>
                      <input style={theme.input} type="number" placeholder="10" value={newRuleValue} onChange={(e) => setNewRuleValue(e.target.value)} required />
                    </div>
                    <div>
                      <label style={theme.label}>Min Spend</label>
                      <input style={theme.input} type="number" placeholder="500" value={newRuleMinOrderValue} onChange={(e) => setNewRuleMinOrderValue(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 42 }}>
                      <input type="checkbox" id="stackable" checked={newRuleStackable} onChange={(e) => setNewRuleStackable(e.target.checked)} style={{ cursor: 'pointer', width: 15, height: 15 }} />
                      <label htmlFor="stackable" style={{ ...theme.label, marginBottom: 0, cursor: 'pointer' }}>Stackable</label>
                    </div>
                  </div>

                  <button type="submit" style={theme.formBtn}>Create Rule</button>
                </form>

                {/* Cart Form */}
                <form onSubmit={handleAddItem}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#6366f1', marginBottom: 12 }}>+ Custom Cart Item</div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={theme.label}>Item ID</label>
                      <input style={theme.input} type="text" placeholder="ITEM-07" value={newItemId} onChange={(e) => setNewItemId(e.target.value)} required />
                    </div>
                    <div>
                      <label style={theme.label}>Product Name</label>
                      <input style={theme.input} type="text" placeholder="Coffee Mug" value={newItemProduct} onChange={(e) => setNewItemProduct(e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={theme.label}>Brand</label>
                      <input style={theme.input} type="text" placeholder="Nordic Basics" value={newItemBrand} onChange={(e) => setNewItemBrand(e.target.value)} required />
                    </div>
                    <div>
                      <label style={theme.label}>Platform</label>
                      <input style={theme.input} type="text" placeholder="Amazon India" value={newItemPlatform} onChange={(e) => setNewItemPlatform(e.target.value)} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={theme.label}>Base Price (Rs.)</label>
                      <input style={theme.input} type="number" placeholder="299" value={newItemBasePrice} onChange={(e) => setNewItemBasePrice(e.target.value)} required />
                    </div>
                    <div>
                      <label style={theme.label}>Category</label>
                      <input style={theme.input} type="text" placeholder="Kitchen" value={newItemCategory} onChange={(e) => setNewItemCategory(e.target.value)} />
                    </div>
                  </div>

                  <button type="submit" style={theme.formBtn}>Create Item</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Rules List */}
        {activeTab === 'rules' && (
          <div style={theme.card}>
            <div style={theme.cardTitle}>🏷️ Loaded Rules Settings</div>
            <DataTable columns={rulesColumns} rows={rules} emptyMessage="No rules configured. Go to Control Center to upload or add manually." />
          </div>
        )}

        {/* Tab 3: Cart List */}
        {activeTab === 'cart' && (
          <div style={theme.card}>
            <div style={theme.cardTitle}>🛒 Cart Item Inventory</div>
            <DataTable columns={cartColumns} rows={cartItems} emptyMessage="No items in the cart. Go to Control Center to upload or add manually." />
          </div>
        )}

        {/* Results / Live Calculations Dashboard */}
        {results ? (
          <div style={theme.card}>
            <div style={theme.cardTitle}>📊 Dynamic Cart Summary & Calculations</div>

            {/* Analytics Dashboard Header */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: darkMode ? '#111827' : '#f1f5f9', padding: '0.95rem', borderRadius: 8, border: darkMode ? '1px solid #374151' : '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: darkMode ? '#9ca3af' : '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Original Total</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: darkMode ? '#f1f5f9' : '#0f172a', marginTop: 6 }}>Rs.{totalOriginal.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#ecfdf5', padding: '0.95rem', borderRadius: 8, border: darkMode ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid #a7f3d0', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#10b981', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Total Savings</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#10b981', marginTop: 6 }}>Rs.{totalSavings.toLocaleString('en-IN')} ({savingsPct}%)</div>
              </div>
              <div style={{ background: '#6366f1', padding: '0.95rem', borderRadius: 8, textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)' }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Final checkout</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#fff', marginTop: 6 }}>Rs.{totalFinal.toLocaleString('en-IN')}</div>
              </div>
              <div style={{ background: darkMode ? 'rgba(249, 115, 22, 0.1)' : '#fff7ed', padding: '0.95rem', borderRadius: 8, border: darkMode ? '1px solid rgba(249, 115, 22, 0.2)' : '1px solid #ffedd5', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#ea580c', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>Active Rules</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#ea580c', marginTop: 6 }}>{activeRulesCount} / {rules.length}</div>
              </div>
            </div>

            {/* Calculations List */}
            <DataTable columns={resultsColumns} rows={results} />
            
            {/* Total Row */}
            <div style={theme.totalRow}>
              <button
                onClick={handleExportCSV}
                style={{
                  ...theme.btnPrimary,
                  background: darkMode ? '#111827' : '#0f172a',
                  border: darkMode ? '1px solid #374151' : '1px solid #d1d5db',
                  marginRight: 'auto',
                  padding: '0.5rem 1.15rem',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                💾 Export Results (CSV)
              </button>
              <span style={theme.totalLabel}>Cart checkout total:</span>
              <span style={{ ...theme.totalValue, fontSize: 18, color: '#6366f1' }}>Rs.{totalFinal.toLocaleString('en-IN')}</span>
            </div>
          </div>
        ) : (
          <div style={{ ...theme.card, textAlign: 'center', padding: '2rem 1.5rem', color: '#6b7280' }}>
            🔔 Preload/Upload rules and cart items in the Control Center to begin calculations.
          </div>
        )}
      </div>
    </div>
  )
}
