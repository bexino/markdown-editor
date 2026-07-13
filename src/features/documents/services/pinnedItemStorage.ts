import { getCurrentUser } from '@/shared/lib/auth'
import { guestAuth, guestPinnedStorage } from '@/shared/lib/guestAuth'
import { supabase } from '@/shared/services/supabase'

interface PinnedItemRow {
  document_id: string | null
  folder_id: string | null
}

export interface PinnedItemsRecord {
  documentIds: string[]
  folderIds: string[]
}

async function requireUserId(): Promise<string> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('You must be signed in to manage pinned items.')
  }

  return user.id
}

function mapPinnedItems(rows: PinnedItemRow[]): PinnedItemsRecord {
  return rows.reduce<PinnedItemsRecord>(
    (accumulator, row) => {
      if (row.document_id) {
        accumulator.documentIds.push(row.document_id)
      }

      if (row.folder_id) {
        accumulator.folderIds.push(row.folder_id)
      }

      return accumulator
    },
    {
      documentIds: [],
      folderIds: [],
    },
  )
}

export const pinnedItemStorage = {
  async getAll(): Promise<PinnedItemsRecord> {
    if (guestAuth.isGuest()) {
      return guestPinnedStorage.getAll()
    }

    await requireUserId()

    const { data, error } = await supabase!.from('pinned_items').select('document_id, folder_id')

    if (error) {
      throw new Error(error.message)
    }

    return mapPinnedItems((data ?? []) as PinnedItemRow[])
  },
  async pinDocument(documentId: string): Promise<void> {
    if (guestAuth.isGuest()) {
      guestPinnedStorage.pinDocument(documentId)
      return
    }

    const userId = await requireUserId()

    const { data, error: existingError } = await supabase!
      .from('pinned_items')
      .select('document_id')
      .eq('user_id', userId)
      .eq('document_id', documentId)
      .is('folder_id', null)
      .maybeSingle()

    if (existingError) {
      throw new Error(existingError.message)
    }

    if (data) {
      return
    }

    const { error } = await supabase!.from('pinned_items').insert({
      user_id: userId,
      document_id: documentId,
      folder_id: null,
    })

    if (error) {
      throw new Error(error.message)
    }
  },
  async unpinDocument(documentId: string): Promise<void> {
    if (guestAuth.isGuest()) {
      guestPinnedStorage.unpinDocument(documentId)
      return
    }

    await requireUserId()

    const { error } = await supabase!
      .from('pinned_items')
      .delete()
      .eq('document_id', documentId)
      .is('folder_id', null)

    if (error) {
      throw new Error(error.message)
    }
  },
  async pinFolder(folderId: string): Promise<void> {
    if (guestAuth.isGuest()) {
      guestPinnedStorage.pinFolder(folderId)
      return
    }

    const userId = await requireUserId()

    const { data, error: existingError } = await supabase!
      .from('pinned_items')
      .select('folder_id')
      .eq('user_id', userId)
      .eq('folder_id', folderId)
      .is('document_id', null)
      .maybeSingle()

    if (existingError) {
      throw new Error(existingError.message)
    }

    if (data) {
      return
    }

    const { error } = await supabase!.from('pinned_items').insert({
      user_id: userId,
      document_id: null,
      folder_id: folderId,
    })

    if (error) {
      throw new Error(error.message)
    }
  },
  async unpinFolder(folderId: string): Promise<void> {
    if (guestAuth.isGuest()) {
      guestPinnedStorage.unpinFolder(folderId)
      return
    }

    await requireUserId()

    const { error } = await supabase!
      .from('pinned_items')
      .delete()
      .eq('folder_id', folderId)
      .is('document_id', null)

    if (error) {
      throw new Error(error.message)
    }
  },
}
