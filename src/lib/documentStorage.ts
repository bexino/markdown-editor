import { getCurrentUser } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export interface DocumentRecord {
  id: string
  name: string
  content: string
  createdAt: string
  updatedAt: string
}

interface DocumentRow {
  id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

function mapDocumentRow(row: DocumentRow): DocumentRecord {
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
    throw new Error('You must be signed in to access documents.')
  }

  return user.id
}

export const documentStorage = {
  async getAll(): Promise<DocumentRecord[]> {
    await requireUserId()

    const { data, error } = await supabase
      .from('documents')
      .select('id, title, content, created_at, updated_at')
      .order('updated_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map(mapDocumentRow)
  },
  async getById(id: string): Promise<DocumentRecord | null> {
    await requireUserId()

    const { data, error } = await supabase
      .from('documents')
      .select('id, title, content, created_at, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? mapDocumentRow(data) : null
  },
  async create(name: string, content: string): Promise<DocumentRecord> {
    const userId = await requireUserId()

    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        title: name,
        content,
      })
      .select('id, title, content, created_at, updated_at')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return mapDocumentRow(data)
  },
  async delete(id: string): Promise<void> {
    await requireUserId()

    const { error } = await supabase.from('documents').delete().eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  },
}
