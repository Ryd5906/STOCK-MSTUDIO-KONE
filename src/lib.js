import { FABRICS } from './data'

const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })

export const amount = (value) =>
  nf.format(Math.round(value)).replace(/\u202f/g, '\u00a0')
export const fcfa = (value) => `${amount(value)} FCFA`
export const pct = (value) => `${Math.round(value)} %`
export const timeHM = (ts) =>
  new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

export function unitLabel(unit, qty = 2) {
  if (unit === 'rouleau') return qty > 1 ? 'rouleaux' : 'rouleau'
  if (unit === 'metre') return qty > 1 ? 'mètres' : 'mètre'
  return qty > 1 ? 'pagnes' : 'pagne'
}

export function stockStatus(fabric) {
  if (fabric.qty === 0) return 'out'
  if (fabric.qty <= fabric.threshold) return 'low'
  return 'ok'
}

export const STATUS_LABEL = { out: 'Rupture', low: 'Stock bas', ok: 'En stock' }

export const marginOf = (f) => f.price - f.cost
export const marginPctOf = (f) => (f.price > 0 ? (marginOf(f) / f.price) * 100 : 0)
export const potentialOf = (f) => marginOf(f) * f.qty
export const stockValueOf = (f) => f.cost * f.qty

const swatchCache = new Map()

export function swatchOf(fabric) {
  if (fabric.photo) return fabric.photo
  if (swatchCache.has(fabric.id)) return swatchCache.get(fabric.id)

  const [a, b, c] = fabric.palette
  let tile = ''
  if (fabric.motif === 'dots') {
    tile = `<circle cx="30" cy="30" r="11" fill="${b}"/><circle cx="90" cy="90" r="16" fill="${c}"/><circle cx="90" cy="30" r="5" fill="${c}"/><circle cx="30" cy="90" r="5" fill="${b}"/>`
  } else if (fabric.motif === 'diamond') {
    tile = `<rect x="18" y="18" width="26" height="26" fill="${b}" transform="rotate(45 31 31)"/><rect x="72" y="72" width="26" height="26" fill="${c}" transform="rotate(45 85 85)"/><circle cx="90" cy="30" r="6" fill="${c}"/><circle cx="30" cy="90" r="6" fill="${b}"/>`
  } else if (fabric.motif === 'petal') {
    tile = `<g transform="translate(32 32)"><ellipse rx="18" ry="9" fill="${b}"/><ellipse rx="9" ry="18" fill="${c}" opacity=".9"/></g><g transform="translate(92 92)"><ellipse rx="14" ry="7" fill="${c}"/><ellipse rx="7" ry="14" fill="${b}"/></g><circle cx="92" cy="28" r="5" fill="${c}"/><circle cx="28" cy="92" r="5" fill="${b}"/>`
  } else {
    tile = `<path d="M0 30 Q30 10 60 30 T120 30" fill="none" stroke="${b}" stroke-width="12" stroke-linecap="round"/><path d="M0 90 Q30 70 60 90 T120 90" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round"/>`
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><pattern id="p" width="120" height="120" patternUnits="userSpaceOnUse">${tile}</pattern><radialGradient id="v" cx="30%" cy="20%" r="90%"><stop offset="0" stop-color="#fff" stop-opacity=".14"/><stop offset="1" stop-color="#000" stop-opacity=".2"/></radialGradient></defs><rect width="600" height="600" fill="${a}"/><rect width="600" height="600" fill="url(#p)"/><rect width="600" height="600" fill="url(#v)"/></svg>`
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
  swatchCache.set(fabric.id, uri)
  return uri
}

const KEY = 'kone-stock-v1'

export function loadState() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { fabrics: FABRICS, pending: [], syncedAt: Date.now() }
    const saved = JSON.parse(raw)
    return {
      fabrics: Array.isArray(saved.fabrics) && saved.fabrics.length ? saved.fabrics : FABRICS,
      pending: Array.isArray(saved.pending) ? saved.pending : [],
      syncedAt: saved.syncedAt || Date.now(),
    }
  } catch {
    return { fabrics: FABRICS, pending: [], syncedAt: Date.now() }
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function resetState() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // rien à faire
  }
}

export function newId() {
  return `f-${Date.now().toString(36)}`
}

export function fileToPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Choisissez une image.'))
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, 900 / Math.max(img.width, img.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Image illisible.'))
    }
    img.src = url
  })
}
