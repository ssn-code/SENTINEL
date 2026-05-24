import React, { useState, useEffect, useMemo } from 'react'
import { Search, ArrowUpDown, Shield, Activity, X } from 'lucide-react'
import { SafetyRing } from '../../components/Charts'
import { motion, AnimatePresence } from 'motion/react'
import { fetchApiJson } from '../../lib/api'

interface RegionData {
  id: string
  name: string
  state: string
  ipc_rate: number
  violent: number
  property: number
  cyber: number
  women_safety: number
  safety_score: number
  safety_level: string
}

export const Dashboard: React.FC = () => {

  const [regions, setRegions] = useState<RegionData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState({
    total_ipc_crimes: 0,
    regions_tracked: 0,
    safest_state: 'N/A',
    average_safety_score: 0,
  })

  const [refreshDashboard, setRefreshDashboard] = useState(0);

  const [sortConfig, setSortConfig] = useState<{ key: keyof RegionData; direction: 'asc' | 'desc' } | null>(null)

  const [pinnedRegions, setPinnedRegions] = useState<string[]>(() => {
    const saved = localStorage.getItem('pinned_regions')
    return saved ? JSON.parse(saved) : []
  })

  const [recentRegions, setRecentRegions] = useState<string[]>(() => {
    const saved = localStorage.getItem('recent_regions')
    return saved ? JSON.parse(saved) : []
  })

  /* ---------------- FETCH DATA FROM FASTAPI ---------------- */

  useEffect(() => {
    setIsLoading(true)
    setError(null)

    fetchApiJson<{ states: any[]; summary: typeof summary }>('/dashboard')
      .then(data => {
        const formatted: RegionData[] = data.states.map((row: any) => ({
          id: String(row.id),
          name: row.state,
          state: row.state,
          ipc_rate: row.ipc_crimes,
          violent: row.women_crimes,
          property: row.cyber_crimes,
          cyber: row.cyber_crimes,
          women_safety: row.women_crimes,
          safety_score: row.safety_score,
          safety_level: row.safety_level,
        }))

        setRegions(formatted)
        setSummary(data.summary)
        setCurrentPage(1)
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.')
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [refreshDashboard])

  /* ---------------- LOCAL STORAGE ---------------- */

  useEffect(() => {
    localStorage.setItem('pinned_regions', JSON.stringify(pinnedRegions))
  }, [pinnedRegions])

  useEffect(() => {
    localStorage.setItem('recent_regions', JSON.stringify(recentRegions))
  }, [recentRegions])

  const togglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setPinnedRegions(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  const addToRecent = (id: string) => {
    setRecentRegions(prev => {
      const filtered = prev.filter(r => r !== id)
      return [id, ...filtered].slice(0, 5)
    })
  }

  /* ---------------- STATS ---------------- */

  const stats = useMemo(() => ({
    totalIpc: summary.total_ipc_crimes,
    regions: summary.regions_tracked,
    safestState: summary.safest_state,
    averageSafetyScore: summary.average_safety_score.toFixed(1)
  }), [summary])

  /* ---------------- FILTERING ---------------- */

  const filteredData = useMemo(() => {

    let data = regions.filter(region =>
      region.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (sortConfig) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }

    return data

  }, [searchQuery, sortConfig, regions])

  const paginatedData = filteredData.slice((currentPage - 1) * 10, currentPage * 10)
  const totalPages = Math.ceil(filteredData.length / 10)

  const handleSort = (key: keyof RegionData) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  /* ---------------- UI ---------------- */

  if (isLoading && regions.length === 0) {
    return (
      <div className="pt-32 px-6 text-center text-white">
        <div className="animate-spin inline-block">⏳</div>
        <p className="mt-4">Loading dashboard data...</p>
      </div>
    )
  }

  if (error && regions.length === 0) {
    return (
      <div className="pt-32 px-6 text-center">
        <div className="text-red-400 text-lg mb-4">❌ Error</div>
        <p className="text-white mb-6">{error}</p>
        <button
          onClick={() => setRefreshDashboard((prev) => prev + 1)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
      {error ? (
        <div className="mb-8 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'Total IPC Crimes', value: stats.totalIpc.toLocaleString(), icon: Shield },
          { label: 'Regions Tracked', value: stats.regions, icon: Search },
          { label: 'Safest State', value: stats.safestState, icon: Shield },
          { label: 'Avg Safety Score', value: stats.averageSafetyScore, icon: Activity }
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="w-4 h-4 text-gray-500" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-gray-500">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <button
          onClick={() => setRefreshDashboard((prev) => prev + 1)}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm text-white hover:bg-white/10 transition"
        >
          Refresh Dashboard Data
        </button>

        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search state..."
            className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left">

          <thead>
            <tr className="border-b border-border bg-card/50">

              {[
                { label: 'Region', key: 'name' },
                { label: 'IPC Crimes', key: 'ipc_rate' },
                { label: 'Women Crimes', key: 'women_safety' },
                { label: 'Cyber Crimes', key: 'cyber' },
                { label: 'Safety Score', key: 'safety_score' }
              ].map((col) => (
                <th
                  key={col.label}
                  className="px-6 py-4 text-[10px] font-mono uppercase tracking-widest text-gray-500 cursor-pointer"
                  onClick={() => handleSort(col.key as keyof RegionData)}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}

            </tr>
          </thead>

          <tbody>

            {paginatedData.map(region => (
              <tr
                key={region.id}
                className="hover:bg-card/50 cursor-pointer"
                onClick={() => {
                  setSelectedRegion(region)
                  addToRecent(region.id)
                }}
              >

                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">

                    <button
                      onClick={(e) => togglePin(region.id, e)}
                      className={`${pinnedRegions.includes(region.id) ? 'text-green-500' : 'text-gray-600'}`}
                    >
                      <Shield className="w-4 h-4" />
                    </button>

                    <div className="font-bold text-white">{region.name}</div>

                  </div>
                </td>

                <td className="px-6 py-4">{region.ipc_rate.toLocaleString()}</td>
                <td className="px-6 py-4">{region.women_safety.toLocaleString()}</td>
                <td className="px-6 py-4">{region.cyber.toLocaleString()}</td>
                <td className="px-6 py-4">{Math.round(region.safety_score)}</td>

              </tr>
            ))}

          </tbody>

        </table>

        {/* Pagination */}

        <div className="px-6 py-4 border-t border-border flex justify-between">

          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Prev
          </button>

          <span>Page {currentPage} / {totalPages}</span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>

        </div>

      </div>

      {/* Drawer */}

      <AnimatePresence>
        {selectedRegion && (
          <>
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRegion(null)}
              aria-label="Close region details"
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            />

            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed right-4 top-24 bottom-4 z-50 w-[min(420px,calc(100vw-2rem))] rounded-2xl bg-surface p-6 md:p-8 border border-border shadow-2xl overflow-y-auto"
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedRegion.name}</h2>
                  <p className="mt-2 text-sm text-gray-400">Regional safety summary</p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedRegion(null)}
                  aria-label="Close region details"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-gray-300 transition-colors hover:bg-card hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex justify-center">
                <SafetyRing score={selectedRegion.safety_score} size={160} strokeWidth={12} />
              </div>
            </motion.aside>
          </>

        )}
      </AnimatePresence>

    </div>
  )
}
