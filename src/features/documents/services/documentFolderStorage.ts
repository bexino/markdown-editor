import { getCurrentUser } from '@/shared/lib/auth'
import { supabase } from '@/shared/services/supabase'

import type { DocumentRecord } from '@/features/documents/services/documentStorage'

interface DocumentFolderRow {
  folder_id: string
  document_id: string
}

interface FolderDocumentJoinedRow {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

function mapDocumentRow(row: FolderDocumentJoinedRow): DocumentRecord {
  return {
    id: row.id,
    name: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function requireUserId(): Promise<string> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('You must be signed in to access document folders.')
  }

  return user.id
}

export const documentFolderStorage = {
  async getFolderIdsByDocumentId(documentId: string): Promise<string[]> {
    await requireUserId()

    const { data, error } = await supabase
      .from('folder_documents')
      .select('folder_id')
      .eq('document_id', documentId)

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map((row: Pick<DocumentFolderRow, 'folder_id'>) => row.folder_id)
  },
  async getFolderIdsByDocumentIds(documentIds: string[]): Promise<Record<string, string[]>> {
    await requireUserId()

    if (documentIds.length === 0) {
      return {}
    }

    const { data, error } = await supabase
      .from('folder_documents')
      .select('folder_id, document_id')
      .in('document_id', documentIds)

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).reduce<Record<string, string[]>>((accumulator, row: DocumentFolderRow) => {
      accumulator[row.document_id] = [...(accumulator[row.document_id] ?? []), row.folder_id]
      return accumulator
    }, {})
  },
  async getDocumentsByFolderId(folderId: string): Promise<DocumentRecord[]> {
    await requireUserId()

    const { data, error } = await supabase
      .from('documents')
      .select('id, title, content, created_at, updated_at, folder_documents!inner(folder_id)')
      .eq('folder_documents.folder_id', folderId)
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map((row) => mapDocumentRow(row as FolderDocumentJoinedRow))
  },
  async addDocumentsToFolder(folderId: string, documentIds: string[]): Promise<void> {
    await requireUserId()

    if (documentIds.length === 0) {
      return
    }

    const { error } = await supabase.from('folder_documents').upsert(
      documentIds.map((documentId) => ({
        folder_id: folderId,
        document_id: documentId,
      })),
      {
        onConflict: 'folder_id,document_id',
        ignoreDuplicates: true,
      },
    )

    if (error) {
      throw new Error(error.message)
    }
  },
  async setFoldersForDocument(documentId: string, folderIds: string[]): Promise<void> {
    await requireUserId()

    const { error: deleteError } = await supabase
      .from('folder_documents')
      .delete()
      .eq('document_id', documentId)

    if (deleteError) {
      throw new Error(deleteError.message)
    }

    if (folderIds.length === 0) {
      return
    }

    const { error: insertError } = await supabase.from('folder_documents').insert(
      folderIds.map((folderId) => ({
        folder_id: folderId,
        document_id: documentId,
      })),
    )

    if (insertError) {
      throw new Error(insertError.message)
    }
  },
  async cloneFoldersForDocument(sourceDocumentId: string, targetDocumentId: string): Promise<void> {
    const folderIds = await this.getFolderIdsByDocumentId(sourceDocumentId)
    await this.setFoldersForDocument(targetDocumentId, folderIds)
  },
}
