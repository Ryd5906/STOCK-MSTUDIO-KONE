import { useMemo, useState } from 'react'
import { CATEGORIES } from '../data'
import { fcfa, stockStatus, unitLabel } from '../lib'
import { SyncBar, TopBar } from '../shell'
import { EmptyState, FabricImage, IconSearch, StatusBadge } from '../ui'

const FILTERS = [
  { value: 'all', label: 'Tous' },
  { value: 'alert', label: 'À réapprovisionner' },
  { value: 'out', label: 'Rupture' },
]

export default function Stock({
  fabrics,
  online,
  syncing,
  pendingCount,
  syncedAt,
  filter = 'all',
  onFilterChange,
  onOpenSync,
  onOpenFabric,
}) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Toutes')

  const list = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return fabrics
      .filter((fabric) => {
        const status = stockStatus(fabric)
        if (filter === 'alert' && status === 'ok') return false
        if (filter === 'out' && status !== 'out') return false
        if (category !== 'Toutes' && fabric.category !== category) return false
        if (!needle) return true
        return (
          fabric.name.toLowerCase().includes(needle) ||
          fabric.ref.toLowerCase().includes(needle) ||
          fabric.category.toLowerCase().includes(needle)
        )
      })
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
  }, [fabrics, query, filter, category])

  return (
    <div className="screen">
      <TopBar
        eyebrow={`CATALOGUE · ${String(fabrics.length).padStart(2, '0')} RÉFÉRENCES`}
        title="Le stock"
        subtitle="Un tissu, une unité de vente."
      />
      <SyncBar
        online={online}
        syncing={syncing}
        pendingCount={pendingCount}
        syncedAt={syncedAt}
        onClick={onOpenSync}
      />

      <div className="search">
        <IconSearch />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Nom, référence, catégorie…"
          aria-label="Rechercher un tissu"
        />
      </div>

      <div className="chips" role="group" aria-label="Filtrer par état">
        {FILTERS.map((item) => (
          <button
            key={item.value}
            type="button"
            className="chip"
            aria-pressed={filter === item.value}
            onClick={() => onFilterChange(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="chips chips--soft" role="group" aria-label="Filtrer par catégorie">
        {CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            className="chip chip--soft"
            aria-pressed={category === item}
            onClick={() => setCategory(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <p className="list-meta" aria-live="polite">
        <span>
          {list.length} tissu{list.length > 1 ? 's' : ''}
        </span>
        <span>tri alphabétique</span>
      </p>

      {list.length === 0 ? (
        <EmptyState
          title="Aucun tissu trouvé"
          text="Essayez une autre recherche ou retirez les filtres."
        />
      ) : (
        <ul className="fabric-list">
          {list.map((fabric) => {
            const status = stockStatus(fabric)
            return (
              <li key={fabric.id}>
                <button
                  type="button"
                  className="fabric-row"
                  onClick={() => onOpenFabric(fabric.id)}
                >
                  <FabricImage fabric={fabric} className="stamp-thumb stamp-thumb--lg" />
                  <span className="fabric-row__body">
                    <strong className="fabric-row__name">{fabric.name}</strong>
                    <small className="fabric-row__meta">
                      {fabric.ref} · {fabric.category}
                    </small>
                    <span className="fabric-row__foot">
                      <StatusBadge status={status} />
                      <small className="fabric-row__price">{fcfa(fabric.price)}</small>
                    </span>
                  </span>
                  <span className={`fabric-row__qty fabric-row__qty--${status}`}>
                    <strong>{fabric.qty}</strong>
                    <small>{unitLabel(fabric.unit, fabric.qty)}</small>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
