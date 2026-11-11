import { useState } from 'react'
import {
  fcfa,
  marginOf,
  marginPctOf,
  pct,
  stockStatus,
  swatchOf,
  unitLabel,
} from '../lib'
import { IconBack, IconWifiOff, StatusBadge, Stepper } from '../ui'

export default function FabricDetail({ fabric, online, onSave, onBack }) {
  const [draft, setDraft] = useState(fabric.qty)
  const status = stockStatus({ ...fabric, qty: draft })
  const margin = marginOf(fabric)
  const marginPct = marginPctOf(fabric)
  const changed = draft !== fabric.qty
  const unitNow = unitLabel(fabric.unit, draft)
  const suggested = status === 'ok' ? 0 : Math.max(0, fabric.threshold + 1 - draft)
  const unitSuggested = unitLabel(fabric.unit, suggested)

  return (
    <div className="screen screen--detail">
      <div className="detail-hero">
        <div
          className="detail-hero__image"
          style={{ backgroundImage: `url("${swatchOf(fabric)}")` }}
          role="img"
          aria-label={`Tissu ${fabric.name}`}
        />
        <div className="detail-hero__shade" aria-hidden="true" />
        <button type="button" className="round-btn detail__back" onClick={onBack} aria-label="Retour">
          <IconBack />
        </button>
        {!online ? (
          <span className="detail__offline">
            <IconWifiOff />
            Hors-ligne
          </span>
        ) : null}
        <span className="detail-hero__tag">
          {fabric.ref} · {fabric.category}
        </span>
      </div>

      <div className="detail__body">
        <p className="label">{fabric.location}</p>
        <h1 className="detail__title">{fabric.name}</h1>

        <div className="detail__status">
          <StatusBadge status={status} />
          <span>
            Seuil d'alerte : {fabric.threshold} {unitLabel(fabric.unit, fabric.threshold)}
          </span>
        </div>

        <section className="stock-card" aria-label="Quantité en stock">
          <span className="label">Stock actuel</span>
          <Stepper
            value={draft}
            unit={unitNow}
            onChange={(delta) => setDraft((value) => Math.max(0, value + delta))}
          />
          <p className="stock-card__foot">
            {suggested > 0
              ? `Réassort suggéré : +${suggested} ${unitSuggested}`
              : `Au-dessus du seuil de ${fabric.threshold} ${unitLabel(fabric.unit, fabric.threshold)}`}
          </p>
        </section>

        <section className="money" aria-label="Indicateurs financiers">
          <h2 className="money__title">Indicateurs</h2>
          <div className="money-grid">
            <div className="money-cell">
              <span className="money-cell__label">Prix unitaire</span>
              <strong className="money-cell__value">{fcfa(fabric.price)}</strong>
            </div>
            <div className="money-cell">
              <span className="money-cell__label">Coût unitaire</span>
              <strong className="money-cell__value">{fcfa(fabric.cost)}</strong>
            </div>
            <div className="money-cell">
              <span className="money-cell__label">Marge unitaire</span>
              <strong className="money-cell__value pos">+{fcfa(margin)}</strong>
            </div>
            <div className="money-cell">
              <span className="money-cell__label">Taux de marge</span>
              <strong className="money-cell__value">{pct(marginPct)}</strong>
            </div>
          </div>
        </section>

        <section className="potential" aria-label="Marge potentielle du stock restant">
          <span className="potential__label">Marge potentielle du stock restant</span>
          <strong className="potential__value">{fcfa(margin * draft)}</strong>
          <span className="potential__calc">
            {draft} {unitLabel(fabric.unit, draft)} × {fcfa(margin)}
          </span>
        </section>
      </div>

      <div className="detail__cta">
        {!online ? (
          <p className="detail__note">
            Hors-ligne : la modification sera synchronisée au retour du réseau.
          </p>
        ) : null}
        <button
          type="button"
          className="btn btn--primary btn--block"
          disabled={!changed}
          onClick={() => onSave(draft - fabric.qty)}
        >
          {changed ? (online ? 'Enregistrer la modification' : 'Enregistrer hors-ligne') : 'Stock à jour'}
        </button>
      </div>
    </div>
  )
}
