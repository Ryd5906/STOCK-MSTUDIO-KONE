import { timeHM } from './lib'
import { IconClose, IconWifi, IconWifiOff } from './ui'

export function TopBar({ eyebrow, title, subtitle }) {
  return (
    <header className="topbar">
      <div className="topbar__meta">
        <span className="logotype">{eyebrow}</span>
        <span className="topbar__line" aria-hidden="true" />
        <span className="monogram" aria-hidden="true">
          MK
        </span>
      </div>
      <h1 className="topbar__title">{title}</h1>
      {subtitle ? <p className="topbar__sub">{subtitle}</p> : null}
    </header>
  )
}

export function SyncBar({ online, syncing, pendingCount, syncedAt, onClick }) {
  const plural = pendingCount > 1 ? 's' : ''
  let tone = 'ok'
  let text = `En ligne · à jour à ${timeHM(syncedAt)}`

  if (syncing) {
    tone = 'sync'
    text = 'Synchronisation en cours…'
  } else if (!online) {
    tone = 'off'
    text = pendingCount
      ? `Hors-ligne · ${pendingCount} modification${plural} en attente`
      : 'Hors-ligne · enregistré sur cet appareil'
  } else if (pendingCount) {
    tone = 'sync'
    text = `${pendingCount} modification${plural} en attente d'envoi`
  }

  return (
    <button
      type="button"
      className={`sync sync--${tone}`}
      onClick={onClick}
      aria-label={`${text}. Ouvrir les détails de synchronisation.`}
    >
      <span className="sync__icon" aria-hidden="true">
        {online ? <IconWifi /> : <IconWifiOff />}
      </span>
      <span className="sync__text" aria-live="polite">
        {text}
      </span>
      <span className="sync__chev" aria-hidden="true">
        ›
      </span>
    </button>
  )
}

export function BottomNav({ active, onNavigate }) {
  const items = [
    { key: 'home', label: 'Accueil' },
    { key: 'stock', label: 'Stock' },
    { key: 'profit', label: 'Rentabilité' },
  ]
  return (
    <nav className="nav" aria-label="Navigation principale">
      <div className="nav__inner">
        {items.map((item, index) => (
          <button
            key={item.key}
            type="button"
            className={`nav__item${active === item.key ? ' is-active' : ''}`}
            aria-current={active === item.key ? 'page' : undefined}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav__num" aria-hidden="true">
              {`0${index + 1}`}
            </span>
            <span className="nav__label">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export function SyncSheet({
  online,
  syncing,
  pendingCount,
  syncedAt,
  demoOffline,
  onToggleDemo,
  onClose,
}) {
  return (
    <div className="sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sync-title"
        onClick={(event) => event.stopPropagation()}
      >
        <span className="sheet__handle" aria-hidden="true" />
        <div className="sheet__head">
          <div>
            <p className="label">Carnet local</p>
            <h2 className="sheet__title" id="sync-title">
              Synchronisation
            </h2>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Fermer">
            <IconClose />
          </button>
        </div>

        <dl className="sheet-list">
          <div>
            <dt>Réseau</dt>
            <dd className={online ? 'is-ok' : 'is-off'}>{online ? 'En ligne' : 'Hors-ligne'}</dd>
          </div>
          <div>
            <dt>Modifications en attente</dt>
            <dd>{pendingCount}</dd>
          </div>
          <div>
            <dt>Dernier enregistrement</dt>
            <dd>{timeHM(syncedAt)}</dd>
          </div>
        </dl>

        <p className="sheet__text">
          {syncing
            ? 'Envoi des modifications en cours vers le serveur.'
            : 'Les quantités modifiées hors-ligne restent écrites sur cet appareil et partent dès le retour du réseau.'}
        </p>

        <label className="switch-row">
          <span>
            <strong>Simuler le mode hors-ligne</strong>
            <small>Réservé à la démonstration et aux tests réseau.</small>
          </span>
          <input type="checkbox" role="switch" checked={demoOffline} onChange={onToggleDemo} />
        </label>

        <button type="button" className="btn btn--ghost btn--block" onClick={onClose}>
          Fermer
        </button>
      </div>
    </div>
  )
}

export function Toast({ message }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  )
}
