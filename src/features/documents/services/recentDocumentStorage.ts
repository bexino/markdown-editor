export interface RecentDocumentRecord {
  id: string
  name: string
  viewedAt: string
}

const STORAGE_KEY = 'markdown-editor.recent-documents'
const MAX_RECENT_DOCUMENTS = 6

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function isRecentDocumentRecord(value: unknown): value is RecentDocumentRecord {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>

  return (
    typeof record.id === 'string' &&
    typeof record.name === 'string' &&
    typeof record.viewedAt === 'string'
  )
}

function readRecords(): RecentDocumentRecord[] {
  if (!canUseLocalStorage()) {
    return []
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY)

  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue)

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(isRecentDocumentRecord).slice(0, MAX_RECENT_DOCUMENTS)
  } catch {
    return []
  }
}

function writeRecords(records: RecentDocumentRecord[]): void {
  if (!canUseLocalStorage()) {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.slice(0, MAX_RECENT_DOCUMENTS)))
}

export const recentDocumentStorage = {
  getAll(): RecentDocumentRecord[] {
    return readRecords()
  },
  add(input: { id: string; name: string }): RecentDocumentRecord[] {
    const records = readRecords()
    const nextRecords: RecentDocumentRecord[] = [
      {
        id: input.id,
        name: input.name,
        viewedAt: new Date().toISOString(),
      },
      ...records.filter((record) => record.id !== input.id),
    ]

    writeRecords(nextRecords)
    return nextRecords.slice(0, MAX_RECENT_DOCUMENTS)
  },
  remove(id: string): RecentDocumentRecord[] {
    const nextRecords = readRecords().filter((record) => record.id !== id)
    writeRecords(nextRecords)
    return nextRecords
  },
}
