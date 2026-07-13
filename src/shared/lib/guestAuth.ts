import type { Session } from '@supabase/supabase-js'

import type { DocumentRecord } from '@/features/documents/services/documentStorage'
import type { FolderRecord } from '@/features/documents/services/folderStorage'
import type { PinnedItemsRecord } from '@/features/documents/services/pinnedItemStorage'

const GUEST_SESSION_KEY = 'markdown-editor.guest.active'
const GUEST_DOCS_KEY = 'markdown-editor.guest.documents'
const GUEST_FOLDERS_KEY = 'markdown-editor.guest.folders'
const GUEST_FOLDER_DOCS_KEY = 'markdown-editor.guest.folder_documents'
const GUEST_PINNED_KEY = 'markdown-editor.guest.pinned'

export interface GuestUser {
  id: string
  email: string
  user_metadata: Record<string, unknown>
  app_metadata: Record<string, unknown>
  aud: string
  created_at: string
}

interface FolderDocumentLink {
  folderId: string
  documentId: string
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback
  }

  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown): void {
  if (!canUseStorage()) {
    return
  }

  window.localStorage.setItem(key, JSON.stringify(value))
}

export const guestAuth = {
  isGuest(): boolean {
    if (!canUseStorage()) {
      return false
    }

    return window.sessionStorage.getItem(GUEST_SESSION_KEY) === 'true'
  },

  loginAsGuest(): void {
    if (!canUseStorage()) {
      return
    }

    window.sessionStorage.setItem(GUEST_SESSION_KEY, 'true')
  },

  logout(): void {
    if (!canUseStorage()) {
      return
    }

    window.sessionStorage.removeItem(GUEST_SESSION_KEY)
  },

  getUser(): GuestUser | null {
    if (!guestAuth.isGuest()) {
      return null
    }

    return {
      id: 'guest',
      email: 'guest@local',
      user_metadata: {
        full_name: 'Guest',
        username: 'guest',
      },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }
  },

  getFakeSession(): Session | null {
    if (!guestAuth.isGuest()) {
      return null
    }

    const user = guestAuth.getUser()
    if (!user) {
      return null
    }

    return {
      access_token: 'guest-token',
      refresh_token: 'guest-refresh',
      expires_in: 9999999,
      expires_at: 9999999999,
      token_type: 'bearer',
      user: user as unknown as Session['user'],
    }
  },
}

export const guestDocumentStorage = {
  getAll(): DocumentRecord[] {
    return readJson<DocumentRecord[]>(GUEST_DOCS_KEY, [])
  },

  getById(id: string): DocumentRecord | null {
    return guestDocumentStorage.getAll().find((doc) => doc.id === id) ?? null
  },

  create(name: string, content: string): DocumentRecord {
    const docs = guestDocumentStorage.getAll()
    const now = new Date().toISOString()
    const record: DocumentRecord = {
      id: crypto.randomUUID(),
      name,
      content,
      createdAt: now,
      updatedAt: now,
    }

    docs.unshift(record)
    writeJson(GUEST_DOCS_KEY, docs)
    return record
  },

  update(id: string, input: { name: string; content: string }): DocumentRecord {
    const docs = guestDocumentStorage.getAll()
    const index = docs.findIndex((doc) => doc.id === id)

    if (index === -1) {
      throw new Error('Document not found.')
    }

    const now = new Date().toISOString()
    const updated: DocumentRecord = {
      id,
      name: input.name,
      content: input.content,
      createdAt: docs[index]!.createdAt,
      updatedAt: now,
    }

    docs[index] = updated
    writeJson(GUEST_DOCS_KEY, docs)
    return updated
  },

  delete(id: string): void {
    const docs = guestDocumentStorage.getAll().filter((doc) => doc.id !== id)
    writeJson(GUEST_DOCS_KEY, docs)

    const links = guestFolderDocStorage.getAll().filter((link) => link.documentId !== id)
    writeJson(GUEST_FOLDER_DOCS_KEY, links)

    const pinned = guestPinnedStorage.getAll()
    pinned.documentIds = pinned.documentIds.filter((pid) => pid !== id)
    writeJson(GUEST_PINNED_KEY, pinned)
  },
}

export const guestFolderStorage = {
  getAll(): FolderRecord[] {
    return readJson<FolderRecord[]>(GUEST_FOLDERS_KEY, [])
  },

  getById(id: string): FolderRecord | null {
    return guestFolderStorage.getAll().find((folder) => folder.id === id) ?? null
  },

  create(name: string): FolderRecord {
    const folders = guestFolderStorage.getAll()
    const now = new Date().toISOString()
    const record: FolderRecord = {
      id: crypto.randomUUID(),
      name,
      createdAt: now,
      updatedAt: now,
    }

    folders.push(record)
    writeJson(GUEST_FOLDERS_KEY, folders)
    return record
  },

  update(id: string, input: { name: string }): FolderRecord {
    const folders = guestFolderStorage.getAll()
    const index = folders.findIndex((folder) => folder.id === id)

    if (index === -1) {
      throw new Error('Folder not found.')
    }

    const now = new Date().toISOString()
    const updated: FolderRecord = {
      id,
      name: input.name,
      createdAt: folders[index]!.createdAt,
      updatedAt: now,
    }

    folders[index] = updated
    writeJson(GUEST_FOLDERS_KEY, folders)
    return updated
  },

  delete(id: string): void {
    const folders = guestFolderStorage.getAll().filter((folder) => folder.id !== id)
    writeJson(GUEST_FOLDERS_KEY, folders)

    const links = guestFolderDocStorage.getAll().filter((link) => link.folderId !== id)
    writeJson(GUEST_FOLDER_DOCS_KEY, links)

    const pinned = guestPinnedStorage.getAll()
    pinned.folderIds = pinned.folderIds.filter((fid) => fid !== id)
    writeJson(GUEST_PINNED_KEY, pinned)
  },
}

export const guestFolderDocStorage = {
  getAll(): FolderDocumentLink[] {
    return readJson<FolderDocumentLink[]>(GUEST_FOLDER_DOCS_KEY, [])
  },

  getFolderIdsByDocumentId(documentId: string): string[] {
    return guestFolderDocStorage
      .getAll()
      .filter((link) => link.documentId === documentId)
      .map((link) => link.folderId)
  },

  getFolderIdsByDocumentIds(documentIds: string[]): Record<string, string[]> {
    const idSet = new Set(documentIds)
    const result: Record<string, string[]> = {}

    for (const link of guestFolderDocStorage.getAll()) {
      if (idSet.has(link.documentId)) {
        result[link.documentId] = [...(result[link.documentId] ?? []), link.folderId]
      }
    }

    return result
  },

  getDocumentsByFolderId(folderId: string): DocumentRecord[] {
    const links = guestFolderDocStorage.getAll().filter((link) => link.folderId === folderId)
    const docs = guestDocumentStorage.getAll()
    const docMap = new Map(docs.map((doc) => [doc.id, doc]))

    return links
      .map((link) => docMap.get(link.documentId))
      .filter((doc): doc is DocumentRecord => doc !== undefined)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  },

  addDocumentsToFolder(folderId: string, documentIds: string[]): void {
    const existing = guestFolderDocStorage.getAll()
    const existingSet = new Set(existing.map((l) => `${l.folderId}:${l.documentId}`))
    const newLinks: FolderDocumentLink[] = []

    for (const documentId of documentIds) {
      const key = `${folderId}:${documentId}`
      if (!existingSet.has(key)) {
        newLinks.push({ folderId, documentId })
      }
    }

    if (newLinks.length > 0) {
      writeJson(GUEST_FOLDER_DOCS_KEY, [...existing, ...newLinks])
    }
  },

  setFoldersForDocument(documentId: string, folderIds: string[]): void {
    const existing = guestFolderDocStorage.getAll().filter((link) => link.documentId !== documentId)
    const newLinks: FolderDocumentLink[] = folderIds.map((folderId) => ({
      folderId,
      documentId,
    }))

    writeJson(GUEST_FOLDER_DOCS_KEY, [...existing, ...newLinks])
  },

  cloneFoldersForDocument(sourceDocumentId: string, targetDocumentId: string): void {
    const folderIds = guestFolderDocStorage.getFolderIdsByDocumentId(sourceDocumentId)
    guestFolderDocStorage.setFoldersForDocument(targetDocumentId, folderIds)
  },
}

export const guestPinnedStorage = {
  getAll(): PinnedItemsRecord {
    return readJson<PinnedItemsRecord>(GUEST_PINNED_KEY, {
      documentIds: [],
      folderIds: [],
    })
  },

  pinDocument(documentId: string): void {
    const pinned = guestPinnedStorage.getAll()

    if (!pinned.documentIds.includes(documentId)) {
      pinned.documentIds.push(documentId)
      writeJson(GUEST_PINNED_KEY, pinned)
    }
  },

  unpinDocument(documentId: string): void {
    const pinned = guestPinnedStorage.getAll()
    pinned.documentIds = pinned.documentIds.filter((id) => id !== documentId)
    writeJson(GUEST_PINNED_KEY, pinned)
  },

  pinFolder(folderId: string): void {
    const pinned = guestPinnedStorage.getAll()

    if (!pinned.folderIds.includes(folderId)) {
      pinned.folderIds.push(folderId)
      writeJson(GUEST_PINNED_KEY, pinned)
    }
  },

  unpinFolder(folderId: string): void {
    const pinned = guestPinnedStorage.getAll()
    pinned.folderIds = pinned.folderIds.filter((id) => id !== folderId)
    writeJson(GUEST_PINNED_KEY, pinned)
  },
}
