import { amount, fcfa, potentialOf, stockStatus, stockValueOf, unitLabel } from '../lib'
import { SyncBar, TopBar } from '../shell'
import { FabricImage } from '../ui'

function today() {
  const label = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

function stampDate() {
  return new Date()
    .toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
    .replace('/', '·')
}

export default function Home({
  fabrics,
  online,
  syncing,
  pendingCount,
  syncedAt,
  onOpenSync,
  onOpenFabric,
  onOpenStock,
  onOpenNew,
  onOpenProfit,
}) {
  const stockValue = fabrics.reduce((sum, fabric) => sum + stockValueOf(fabric), 0)
  const potential = fabrics.reduce((sum, fabric) => sum + potentialOf(fabric), 0)

  const alerts = fabrics
    .filter((fabric) => stockStatus(fabric) !== 'ok')
    .sort((a, b) => (a.qty === 0 ? -1 : b.qty === 0 ? 1 : a.qty - b.qty))

  return (
    <div className="screen">
      <TopBar
        eyebrow="KONÉ TISSUS · ABIDJAN"
        title={
          <>
            Bonjour,
            <br />
            Madame Koné
          </>
        }
        subtitle={today()}
      />
      <SyncBar
        online={online}
        syncing={syncing}
        pendingCount={pendingCount}
        syncedAt={syncedAt}
        onClick={onOpenSync}
      />

      <section className="ledger-hero" aria-label="Résumé de la boutique">
        <div className="ledger-hero__head">
          <span className="label label--light">Valeur du stock</span>
          <span className="ledger-hero__seal" aria-hidden="true">
            Inventaire
            <br />
            {stampDate()}
          </span>
        </div>
        <p className="ledger-hero__value">
          {amount(stockValue)}
          <span>FCFA</span>
        </p>
        <dl className="ledger-hero__stats">
          <div>
            <dt>Marge potentielle</dt>
            <dd>
              {amount(potential)}
              <span>FCFA</span>
            </dd>
          </div>
          <div>
            <dt>Tissus suivis</dt>
            <dd>
              {fabrics.length}
              <span>réf.</span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="block">
        <div className="block__head">
          <h2 className="block__title">Alerte stock</h2>
          <span className="block__count" aria-label={`${alerts.length} tissus à réapprovisionner`}>
            {String(alerts.length).padStart(2, '0')}
          </span>
          <button type="button" className="link-btn" onClick={() => onOpenStock('low')}>
            Tout voir
          </button>
        </div>

        {alerts.length === 0 ? (
          <p className="block__empty">Tous les tissus sont au-dessus du seuil.</p>
        ) : (
          <ol className="alert-list">
            {alerts.slice(0, 3).map((fabric, index) => {
              const status = stockStatus(fabric)
              return (
                <li key={fabric.id}>
                  <button
                    type="button"
                    className="alert-row"
                    onClick={() => onOpenFabric(fabric.id)}
                  >
                    <span className="alert-row__index" aria-hidden="true">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <FabricImage fabric={fabric} className="stamp-thumb" />
                    <span className="alert-row__body">
                      <strong className="alert-row__name">{fabric.name}</strong>
                      <small className="alert-row__meta">
                        {fabric.ref} · seuil {fabric.threshold}{' '}
                        {unitLabel(fabric.unit, fabric.threshold)}
                      </small>
                    </span>
                    <span className={`alert-row__qty alert-row__qty--${status}`}>
                      <strong>{fabric.qty}</strong>
                      <small>{unitLabel(fabric.unit, fabric.qty)}</small>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        )}

        {alerts.length > 3 ? (
          <p className="hint">
            + {alerts.length - 3} autre{alerts.length - 3 > 1 ? 's' : ''} tissu
            {alerts.length - 3 > 1 ? 's' : ''} sous le seuil.
          </p>
        ) : null}
      </section>

      <section className="block">
        <div className="block__head">
          <h2 className="block__title">Actions rapides</h2>
        </div>
        <div className="quick">
          <button type="button" className="quick__card quick__card--accent" onClick={onOpenNew}>
            <span className="quick__index" aria-hidden="true">
              01
            </span>
            <span className="quick__body">
              <strong>Ajouter un tissu</strong>
              <small>Photo, quantité, seuil</small>
            </span>
            <span className="quick__symbol" aria-hidden="true">
              +
            </span>
          </button>
          <button type="button" className="quick__card" onClick={onOpenProfit}>
            <span className="quick__index" aria-hidden="true">
              02
            </span>
            <span className="quick__body">
              <strong>Rentabilité</strong>
              <small>Classement des marges</small>
            </span>
            <span className="quick__symbol" aria-hidden="true">
              ›
            </span>
          </button>
        </div>
      </section>
    </div>
  )
}
