import { useEffect, useRef, useState } from 'react'
import { loadState, newId, saveState } from './lib'
import { SYNC_DELAY_MS } from './config'
import { BottomNav, SyncSheet, Toast } from './shell'
import { IconPlus } from './ui'
import Login from './screens/Login'
import Home from './screens/Home'
import Stock from './screens/Stock'
import FabricDetail from './screens/FabricDetail'
import NewFabric from './screens/NewFabric'
import Profitability from './screens/Profitability'

const NAV_ROUTES = ['home', 'stock', 'profit']

export default function App() {
  const [initial] = useState(loadState)
  const [authed, setAuthed] = useState(false)
  const [route, setRoute] = useState('home')
  const [returnTo, setReturnTo] = useState('home')
  const [selectedId, setSelectedId] = useState(null)
  const [stockFilter, setStockFilter] = useState('all')

  const [fabrics, setFabrics] = useState(initial.fabrics)
  const [pending, setPending] = useState(initial.pending)
  const [syncedAt, setSyncedAt] = useState(initial.syncedAt)

  const [networkOnline, setNetworkOnline] = useState(
    () => (typeof navigator === 'undefined' ? true : navigator.onLine),
  )
  const [demoOffline, setDemoOffline] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const toastId = useRef(0)
  const storageWarned = useRef(false)

  const online = networkOnline && !demoOffline
  const selected = fabrics.find((fabric) => fabric.id === selectedId)

  function notify(text) {
    toastId.current += 1
    setToast({ id: toastId.current, text })
  }

  useEffect(() => {
    if (saveState({ fabrics, pending, syncedAt })) return
    if (storageWarned.current) return
    storageWarned.current = true
    notify('Stockage plein : cette modification ne sera pas conservée')
  }, [fabrics, pending, syncedAt])

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', authed ? '#F2E9D8' : '#16233F')
  }, [authed])

  useEffect(() => {
    const goOnline = () => setNetworkOnline(true)
    const goOffline = () => setNetworkOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  useEffect(() => {
    if (!syncing) return undefined
    const timer = setTimeout(() => {
      setSyncing(false)
      setSyncedAt(Date.now())
    }, SYNC_DELAY_MS)
    return () => clearTimeout(timer)
  }, [syncing])

  useEffect(() => {
    if (!online || pending.length === 0 || syncing) return undefined
    const count = pending.length
    const timer = setTimeout(() => {
      setPending([])
      setSyncing(true)
      notify(
        `${count} modification${count > 1 ? 's' : ''} synchronisée${count > 1 ? 's' : ''}`,
      )
    }, SYNC_DELAY_MS)
    return () => clearTimeout(timer)
  }, [online, pending.length, syncing])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(null), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [route])

  useEffect(() => {
    document.body.classList.toggle('no-scroll', sheetOpen)
    return () => document.body.classList.remove('no-scroll')
  }, [sheetOpen])

  function openFabric(id) {
    setReturnTo(route === 'detail' ? 'stock' : route)
    setSelectedId(id)
    setRoute('detail')
  }

  function openStock(filter = 'all') {
    setStockFilter(filter === 'low' ? 'alert' : filter)
    setRoute('stock')
  }

  function openNew() {
    setReturnTo(route === 'new' ? 'home' : route)
    setRoute('new')
  }

  function navigate(next) {
    if (!NAV_ROUTES.includes(next)) return
    setSelectedId(null)
    if (next === 'stock') setStockFilter('all')
    setRoute(next)
  }

  function saveQuantity(id, delta) {
    const target = fabrics.find((fabric) => fabric.id === id)
    if (!target) return
    const qty = Math.max(0, target.qty + delta)
    setFabrics((list) =>
      list.map((fabric) => (fabric.id === id ? { ...fabric, qty } : fabric)),
    )

    if (online) {
      setSyncing(true)
      notify('Quantité mise à jour')
    } else {
      setPending((list) => [
        ...list,
        { id: newId(), type: 'qty', fabricId: id, qty, at: Date.now() },
      ])
      notify('Enregistré hors-ligne sur cet appareil')
    }

    setSelectedId(null)
    setRoute(returnTo === 'detail' ? 'home' : returnTo)
  }

  function addFabric(fabric) {
    setFabrics((list) => [fabric, ...list])

    if (online) {
      setSyncing(true)
      notify('Tissu ajouté au stock')
    } else {
      setPending((list) => [
        ...list,
        { id: newId(), type: 'create', fabricId: fabric.id, at: Date.now() },
      ])
      notify('Tissu ajouté hors-ligne')
    }

    setStockFilter('all')
    setRoute('stock')
  }

  if (!authed) {
    return (
      <div className="app">
        <Login onEnter={() => setAuthed(true)} />
      </div>
    )
  }

  const showNav = NAV_ROUTES.includes(route)

  return (
    <div className="app">
      {route === 'home' ? (
        <Home
          fabrics={fabrics}
          online={online}
          syncing={syncing}
          pendingCount={pending.length}
          syncedAt={syncedAt}
          onOpenSync={() => setSheetOpen(true)}
          onOpenFabric={openFabric}
          onOpenStock={openStock}
          onOpenNew={openNew}
          onOpenProfit={() => navigate('profit')}
        />
      ) : null}

      {route === 'stock' ? (
        <Stock
          fabrics={fabrics}
          online={online}
          syncing={syncing}
          pendingCount={pending.length}
          syncedAt={syncedAt}
          filter={stockFilter}
          onFilterChange={setStockFilter}
          onOpenSync={() => setSheetOpen(true)}
          onOpenFabric={openFabric}
        />
      ) : null}

      {route === 'profit' ? (
        <Profitability
          fabrics={fabrics}
          online={online}
          syncing={syncing}
          pendingCount={pending.length}
          syncedAt={syncedAt}
          onOpenSync={() => setSheetOpen(true)}
          onOpenFabric={openFabric}
        />
      ) : null}

      {route === 'detail' && selected ? (
        <FabricDetail
          key={selected.id}
          fabric={selected}
          online={online}
          onBack={() => {
            setSelectedId(null)
            setRoute(returnTo === 'detail' ? 'stock' : returnTo)
          }}
          onSave={(delta) => saveQuantity(selected.id, delta)}
        />
      ) : null}

      {route === 'new' ? (
        <NewFabric
          onAdd={addFabric}
          onBack={() => setRoute(returnTo === 'new' ? 'home' : returnTo)}
        />
      ) : null}

      {showNav ? (
        <>
          {route === 'stock' ? (
            <button
              type="button"
              className="fab"
              onClick={openNew}
              aria-label="Ajouter un tissu"
            >
              <IconPlus />
            </button>
          ) : null}
          <BottomNav active={route} onNavigate={navigate} />
        </>
      ) : null}

      {sheetOpen ? (
        <SyncSheet
          online={online}
          syncing={syncing}
          pendingCount={pending.length}
          syncedAt={syncedAt}
          demoOffline={demoOffline}
          onToggleDemo={() => setDemoOffline((value) => !value)}
          onClose={() => setSheetOpen(false)}
        />
      ) : null}

      {toast ? <Toast key={toast.id} message={toast.text} /> : null}
    </div>
  )
}
