import { fcfa, marginOf, marginPctOf, pct, potentialOf, unitLabel } from '../lib'
import { SyncBar, TopBar } from '../shell'

export default function Profitability({
  fabrics,
  online,
  syncing,
  pendingCount,
  syncedAt,
  onOpenSync,
  onOpenFabric,
}) {
  const rows = fabrics
    .map((fabric) => ({
      fabric,
      potential: potentialOf(fabric),
      margin: marginOf(fabric),
      marginPct: marginPctOf(fabric),
    }))
    .sort((a, b) => b.potential - a.potential)

  const total = rows.reduce((sum, row) => sum + row.potential, 0)
  const max = rows.length ? Math.max(rows[0].potential, 1) : 1

  return (
    <div className="screen">
      <TopBar
        eyebrow="ANALYSE · MARGE DU STOCK"
        title="Rentabilité"
        subtitle="Classement de ce qui reste en boutique."
      />
      <SyncBar
        online={online}
        syncing={syncing}
        pendingCount={pendingCount}
        syncedAt={syncedAt}
        onClick={onOpenSync}
      />

      <section className="profit-total" aria-label="Marge potentielle totale">
        <span className="label label--light">Total potentiel</span>
        <strong className="profit-total__value">{fcfa(total)}</strong>
        <span className="profit-total__note">
          (prix de vente − coût fournisseur) × quantité en stock
        </span>
      </section>

      <ul className="profit-list">
        {rows.map((row, index) => {
          const fabric = row.fabric
          return (
            <li key={fabric.id}>
              <button type="button" className="profit-row" onClick={() => onOpenFabric(fabric.id)}>
                <span className={`rank${index < 3 ? ' rank--top' : ''}`} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="profit-row__body">
                  <strong>{fabric.name}</strong>
                  <small>
                    {fabric.qty} {unitLabel(fabric.unit, fabric.qty)} × {fcfa(row.margin)} ·{' '}
                    {pct(row.marginPct)}
                  </small>
                </span>
                <span className="profit-row__amount">{fcfa(row.potential)}</span>
                <span className="bar" aria-hidden="true">
                  <span style={{ width: `${Math.max(0, (row.potential / max) * 100)}%` }} />
                </span>
              </button>
            </li>
          )
        })}
      </ul>

      <p className="hint">
        Le classement utilise la marge du stock restant, hors charges fixes (loyer, transport).
      </p>
    </div>
  )
}
