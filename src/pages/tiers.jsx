import { useEffect, useRef, useState } from 'react'
import axios from 'axios'

const PLAYERS_API_URL = 'https://altertiers.com/api/v1/players'
const PAGE_LIMIT = 50
const CREATOR_NICKNAME = 'vAniqUueee'
let hgh = [
  'vAniqUueee',
  'PekiReki1',
  'TemmieNK2',
  'sadDaunqo16',
  'Diodp2',
  'l1ghtnow',
  'AI_simulation',
  //you will be added if you message on Discord to iamvaniquueee
  //Тебя добавят, если напишешь в Discord пользователю iamvaniquueee
]
const TIER_ORDER = ['HT1', 'LT1', 'HT2', 'LT2', 'HT3', 'LT3', 'HT4', 'LT4', 'HT5', 'LT5']
const KIT_LABELS = {
  sword: 'Sword',
  op: 'OP',
  pot: 'Pot',
  reallyworld: 'ReallyWorld (RW)',
  mace: 'Mace',
}
const playerPageCache = new Map()
let availableKitsCache = []

function getCachedPage(kit, page) {
  return playerPageCache.get(kit)?.get(page)
}

function cachePage(kit, page, data) {
  if (!playerPageCache.has(kit)) {
    playerPageCache.set(kit, new Map())
  }
  playerPageCache.get(kit).set(page, data)
}

function compareByTier(left, right, kit) {
  const leftTier = TIER_ORDER.indexOf(left.tiers[kit]?.toUpperCase())
  const rightTier = TIER_ORDER.indexOf(right.tiers[kit]?.toUpperCase())
  const leftOrder = leftTier < 0 ? TIER_ORDER.length : leftTier
  const rightOrder = rightTier < 0 ? TIER_ORDER.length : rightTier

  return leftOrder - rightOrder || left.rank - right.rank
}

function getRetryDelay(error, attempt) {
  const retryAfter = error.response?.headers?.['retry-after']

  if (retryAfter) {
    const seconds = Number(retryAfter)
    if (Number.isFinite(seconds)) {
      return Math.max(0, seconds * 1000)
    }

    const retryAt = Date.parse(retryAfter)
    if (Number.isFinite(retryAt)) {
      return Math.max(0, retryAt - Date.now())
    }
  }

  return 1000 * (attempt + 1)
}

function waitForRetry(delay, signal) {
  return new Promise((resolve, reject) => {
    let timeout
    const onAbort = () => {
      clearTimeout(timeout)
      reject(new axios.CanceledError())
    }

    if (signal.aborted) {
      onAbort()
      return
    }

    timeout = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, delay)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

async function getPlayersPage(kit, page, signal) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await axios.get(PLAYERS_API_URL, {
        params: { kit, page, limit: PAGE_LIMIT },
        signal,
      })
    } catch (requestError) {
      if (
        !axios.isAxiosError(requestError) ||
        requestError.response?.status !== 429 ||
        attempt === 2
      ) {
        throw requestError
      }

      await waitForRetry(getRetryDelay(requestError, attempt), signal)
    }
  }
}

export default function Tiers() {
  const [players, setPlayers] = useState([])
  const [availableKits, setAvailableKits] = useState(availableKitsCache)
  const [selectedKit, setSelectedKit] = useState('mace')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [loadMoreError, setLoadMoreError] = useState('')
  const loadMoreController = useRef(null)

  useEffect(() => {
    const controller = new AbortController()

    async function loadFirstPage() {
      try {
        const cachedPage = getCachedPage(selectedKit, 1)
        if (cachedPage) {
          await Promise.resolve()
          if (controller.signal.aborted) {
            return
          }
          setPlayers(cachedPage.players)
          setTotalPages(cachedPage.pages)
          setAvailableKits(availableKitsCache)
          return
        }

        const { data: firstPage } = await getPlayersPage(selectedKit, 1, controller.signal)
        const kits = Object.keys(firstPage.players?.[0]?.tiers ?? {})
        if (kits.length > 0) {
          availableKitsCache = kits
          setAvailableKits(kits)
        }

        cachePage(selectedKit, 1, firstPage)
        setPlayers(firstPage.players)
        setCurrentPage(firstPage.page)
        setTotalPages(firstPage.pages)
      } catch (requestError) {
        if (!axios.isCancel(requestError)) {
          const message =
            axios.isAxiosError(requestError) &&
            requestError.response?.status === 429
              ? 'The API rate limit was reached. Wait a little, then try again.'
              : requestError instanceof Error
                ? requestError.message
                : 'Unable to load tier data.'
          setError(message)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    loadFirstPage()
    return () => {
      controller.abort()
      loadMoreController.current?.abort()
      loadMoreController.current = null
    }
  }, [selectedKit])

  function handleKitChange(event) {
    const nextKit = event.target.value
    if (nextKit === selectedKit) {
      return
    }

    loadMoreController.current?.abort()
    setPlayers([])
    setCurrentPage(1)
    setTotalPages(1)
    setLoading(true)
    setLoadingMore(false)
    setError('')
    setLoadMoreError('')
    setSelectedKit(nextKit)
  }

  async function loadMorePlayers() {
    if (loadingMore || currentPage >= totalPages) {
      return
    }

    const page = currentPage + 1
    const controller = new AbortController()
    loadMoreController.current = controller
    setLoadingMore(true)
    setLoadMoreError('')

    try {
      let nextPage = getCachedPage(selectedKit, page)
      if (!nextPage) {
        const response = await getPlayersPage(selectedKit, page, controller.signal)
        nextPage = response.data
        cachePage(selectedKit, page, nextPage)
      }

      if (!controller.signal.aborted) {
        setPlayers((currentPlayers) => [...currentPlayers, ...nextPage.players])
        setCurrentPage(page)
      }
    } catch (requestError) {
      if (!axios.isCancel(requestError)) {
        const message =
          axios.isAxiosError(requestError) &&
          requestError.response?.status === 429
            ? 'The API rate limit was reached. Wait a little, then try again.'
            : requestError instanceof Error
              ? requestError.message
              : 'Unable to load more tier data.'
        setLoadMoreError(message)
      }
    } finally {
      if (loadMoreController.current === controller) {
        loadMoreController.current = null
        setLoadingMore(false)
      }
    }
  }

  const selectedKitLabel = KIT_LABELS[selectedKit] ?? selectedKit
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredPlayers = players
    .filter((player) =>
      player.nickname.toLowerCase().includes(normalizedSearch),
    )
    .sort((left, right) => compareByTier(left, right, selectedKit))

  return (
    <section className="tiers-page">
      <h1>{selectedKitLabel} Tiers</h1>
      <div className="tiers-controls">
        {availableKits.length > 0 && (
          <label className="kit-select">
            Tier category
            <select
              value={selectedKit}
              onChange={handleKitChange}
            >
              {availableKits.map((kit) => (
                <option key={kit} value={kit}>
                  {KIT_LABELS[kit] ?? kit}
                </option>
              ))}
            </select>
          </label>
        )}
        <label className="player-search">
          Search players
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Enter a player name"
          />
        </label>
      </div>

      {loading && <p role="status">Loading {selectedKitLabel} tiers...</p>}
      {error && (
        <p role="alert">
          Could not load {selectedKitLabel} tiers: {error}
        </p>
      )}
      {!loading && !error && (
        <div className="tiers-table-container">
          <table className="tiers-table">
            <thead>
              <tr>
                <th>Id</th>
                <th>Player</th>
                <th>{selectedKitLabel} tier</th>
              </tr>
            </thead>
            <tbody>
              {filteredPlayers.length > 0 ? (
                filteredPlayers.map((player) => {
                  const isCreator =
                    player.nickname.toLowerCase() ===
                    CREATOR_NICKNAME.toLowerCase()
                  const isHighlighted = hgh.some(
                    (nickname) =>
                      nickname.toLowerCase() === player.nickname.toLowerCase(),
                  )

                  return (
                    <tr
                      className={
                        isCreator || isHighlighted
                          ? 'featured-player-row'
                          : undefined
                      }
                      key={player.uuid}
                    >
                      <td>{player.rank}</td>
                      <td>
                        {isCreator ? (
                          <span className="creator-name" title="creator">
                            {player.nickname}
                          </span>
                        ) : (
                          player.nickname
                        )}
                      </td>
                      <td>{player.tiers[selectedKit] ?? '—'}</td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan="3">No players found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {!loading && !error && loadMoreError && (
        <p role="alert">Could not load more players: {loadMoreError}</p>
      )}
      {!loading && !error && currentPage < totalPages && (
        <button
          className="load-more-button"
          type="button"
          onClick={loadMorePlayers}
          disabled={loadingMore}
        >
          {loadingMore ? 'Loading...' : 'Load more'}
        </button>
      )}
    </section>
  )
}
