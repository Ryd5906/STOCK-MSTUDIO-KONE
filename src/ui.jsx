import { STATUS_LABEL, swatchOf } from './lib'

export function FabricImage({ fabric, className = '' }) {
  return (
    <div
      className={`fabric-image ${className}`}
      style={{ backgroundImage: `url("${swatchOf(fabric)}")` }}
      role="img"
      aria-label={fabric.name}
    />
  )
}

export function StatusBadge({ status }) {
  return (
    <span className={`badge badge--${status}`}>
      <span className="badge__dot" aria-hidden="true" />
      {STATUS_LABEL[status]}
    </span>
  )
}

const ONE = { pagnes: 'pagne', rouleaux: 'rouleau', mètres: 'mètre' }

export function Stepper({ value, unit, onChange }) {
  const one = ONE[unit] || unit
  return (
    <div className="stepper">
      <button
        type="button"
        className="step-btn"
        onClick={() => onChange(-1)}
        disabled={value <= 0}
        aria-label={`Retirer un ${one}`}
      >
        <IconMinus />
      </button>
      <div className="stepper__value">
        <span className="stepper__number" aria-live="polite">
          {value}
        </span>
        <span className="stepper__unit">{unit}</span>
      </div>
      <button
        type="button"
        className="step-btn"
        onClick={() => onChange(1)}
        aria-label={`Ajouter un ${one}`}
      >
        <IconPlus />
      </button>
    </div>
  )
}

export function Segmented({ options, value, onChange, label }) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {hint ? <span className="field__hint">{hint}</span> : null}
    </label>
  )
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="empty">
      <div className="empty__mark" aria-hidden="true">
        <IconSearch />
      </div>
      <p className="empty__title">{title}</p>
      <p className="empty__text">{text}</p>
      {action}
    </div>
  )
}

const base = {
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function IconSearch() {
  return (
    <svg {...base}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

export function IconBack() {
  return (
    <svg {...base}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

export function IconPlus() {
  return (
    <svg {...base}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function IconMinus() {
  return (
    <svg {...base}>
      <path d="M5 12h14" />
    </svg>
  )
}

export function IconWifi() {
  return (
    <svg {...base}>
      <path d="M2.5 9a15 15 0 0 1 19 0M6 12.5a10 10 0 0 1 12 0M9.5 16a5 5 0 0 1 5 0" />
      <circle cx="12" cy="19.5" r="0.6" fill="currentColor" />
    </svg>
  )
}

export function IconWifiOff() {
  return (
    <svg {...base}>
      <path d="M2.5 9a15 15 0 0 1 8-3.9M13.5 5.2A15 15 0 0 1 21.5 9M6 12.5a10 10 0 0 1 4-2.2M14 10.4a10 10 0 0 1 4 2.1M9.5 16a5 5 0 0 1 5 0" />
      <path d="M3 3l18 18" />
    </svg>
  )
}

export function IconCheck() {
  return (
    <svg {...base}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  )
}

export function IconCamera() {
  return (
    <svg {...base}>
      <path d="M4 8h3l1.5-2h7L17 8h3v11H4z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  )
}

export function IconClose() {
  return (
    <svg {...base}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}
