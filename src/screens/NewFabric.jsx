import { useMemo, useState } from 'react'
import { UNITS } from '../data'
import { fcfa, fileToPhoto, marginOf, marginPctOf, newId, pct, swatchOf } from '../lib'
import { Field, IconBack, IconCamera, IconCheck, Segmented } from '../ui'

const STYLES = {
  Wax: { palette: ['#B4552F', '#F2C14E', '#FBF3E4'], motif: 'petal' },
  Bazin: { palette: ['#1F4E5F', '#E8B04B', '#F6EDE2'], motif: 'diamond' },
  Kente: { palette: ['#3F7D5A', '#E9C46A', '#1F2A24'], motif: 'stripe' },
  Artisanal: { palette: ['#264653', '#E9C46A', '#F4A261'], motif: 'dots' },
}

const EMPTY = {
  name: '',
  ref: '',
  category: 'Wax',
  unit: 'pagne',
  qty: '0',
  threshold: '5',
  price: '',
  cost: '',
  location: '',
}

export default function NewFabric({ onAdd, onBack }) {
  const [form, setForm] = useState(EMPTY)
  const [photo, setPhoto] = useState(null)
  const [error, setError] = useState('')

  const update = (key) => (event) => {
    const value = event.target.value
    setForm((current) => ({ ...current, [key]: value }))
  }

  const preview = useMemo(
    () => ({
      id: `preview-${form.category}`,
      name: 'Aperçu',
      photo,
      ...STYLES[form.category],
    }),
    [form.category, photo],
  )

  const price = Number(form.price) || 0
  const cost = Number(form.cost) || 0
  const qty = Number(form.qty) || 0
  const margin = price - cost
  const potential = margin * qty

  async function pickPhoto(event) {
    const file = event.target.files && event.target.files[0]
    if (!file) return
    try {
      setPhoto(await fileToPhoto(file))
      setError('')
    } catch (err) {
      setError(err.message)
    }
  }

  function submit(event) {
    event.preventDefault()
    if (!form.name.trim() || !form.ref.trim()) {
      setError('Renseignez le nom et la référence du tissu.')
      return
    }
    if (price <= 0) {
      setError('Indiquez un prix de vente supérieur à zéro.')
      return
    }
    onAdd({
      id: newId(),
      name: form.name.trim(),
      ref: form.ref.trim().toUpperCase(),
      category: form.category,
      unit: form.unit,
      qty: Math.max(0, Math.round(qty)),
      threshold: Math.max(0, Math.round(Number(form.threshold) || 0)),
      price: Math.round(price),
      cost: Math.round(cost),
      location: form.location.trim() || 'Non classé',
      photo,
      ...STYLES[form.category],
    })
  }

  return (
    <form className="screen screen--form" onSubmit={submit}>
      <div className="screen-head">
        <button type="button" className="round-btn" onClick={onBack} aria-label="Retour">
          <IconBack />
        </button>
        <div>
          <p className="label">Fiche inventaire</p>
          <h1 className="screen-head__title">Nouveau tissu</h1>
        </div>
      </div>

      <div className="photo-pick">
        <div className="photo-pick__frame">
          <div
            className="photo-pick__preview"
            style={{ backgroundImage: `url("${swatchOf(preview)}")` }}
            role="img"
            aria-label="Aperçu du tissu"
          />
          <span className="photo-pick__caption">{form.category} · aperçu</span>
        </div>
        <div className="photo-pick__side">
          <label className="btn btn--ghost btn--sm">
            <IconCamera />
            Choisir une photo
            <input type="file" accept="image/*" onChange={pickPhoto} className="visually-hidden" />
          </label>
          <p className="hint">
            La photo de Madame Koné remplace le visuel par défaut de la catégorie.
          </p>
        </div>
      </div>

      <Field label="Nom du tissu">
        <input value={form.name} onChange={update('name')} placeholder="Ex. Wax fleuri Amsterdam" required />
      </Field>

      <div className="field-row">
        <Field label="Référence">
          <input value={form.ref} onChange={update('ref')} placeholder="WX-214" required />
        </Field>
        <Field label="Catégorie">
          <select value={form.category} onChange={update('category')}>
            {Object.keys(STYLES).map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Unité de vente">
        <Segmented
          label="Unité de vente"
          options={UNITS}
          value={form.unit}
          onChange={(unit) => setForm((current) => ({ ...current, unit }))}
        />
      </Field>

      <div className="field-row">
        <Field label="Quantité initiale">
          <input type="number" min="0" inputMode="numeric" value={form.qty} onChange={update('qty')} />
        </Field>
        <Field label="Seuil d'alerte">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={form.threshold}
            onChange={update('threshold')}
          />
        </Field>
      </div>

      <div className="field-row">
        <Field label="Prix de vente (FCFA)">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={form.price}
            onChange={update('price')}
            placeholder="6 000"
            required
          />
        </Field>
        <Field label="Coût fournisseur (FCFA)">
          <input
            type="number"
            min="0"
            inputMode="numeric"
            value={form.cost}
            onChange={update('cost')}
            placeholder="3 500"
          />
        </Field>
      </div>

      <Field label="Emplacement">
        <input value={form.location} onChange={update('location')} placeholder="Étagère B-3" />
      </Field>

      <div className="form-summary">
        <div>
          <small>Marge unitaire</small>
          <strong className={margin >= 0 ? 'pos' : 'neg'}>
            {margin >= 0 ? '+' : ''}
            {fcfa(margin)}
          </strong>
        </div>
        <div>
          <small>Taux de marge</small>
          <strong>{price > 0 ? pct(marginPctOf({ price, cost })) : '—'}</strong>
        </div>
        <div>
          <small>Marge potentielle</small>
          <strong>{fcfa(potential)}</strong>
        </div>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="form-cta">
        <button type="submit" className="btn btn--primary btn--block">
          <IconCheck />
          Ajouter au stock
        </button>
      </div>
    </form>
  )
}
