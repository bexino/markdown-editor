import { getCurrentUser } from '@/shared/lib/auth'
import { supabase } from '@/shared/services/supabase'

export interface FolderRecord {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}

interface FolderRow {
  id: string
  name: string
  created_at: string
  updated_at: string
}

function mapFolderRow(row: FolderRow): FolderRecord {
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function requireUserId(): Promise<string> {
  const user = await getCurrentUser()

  if (!user) {
    throw new Error('You must be signed in to access folders.')
  }

  return user.id
}

export const folderStorage = {
  async getAll(): Promise<FolderRecord[]> {
    await requireUserId()

    const { data, error } = await supabase
      .from('folders')
      .select('id, name, created_at, updated_at')
      .order('created_at', { ascending: true })

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []).map(mapFolderRow)
  },
  async getById(id: string): Promise<FolderRecord | null> {
    await requireUserId()

    const { data, error } = await supabase
      .from('folders')
      .select('id, name, created_at, updated_at')
      .eq('id', id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    return data ? mapFolderRow(data) : null
  },
  async create(name: string): Promise<FolderRecord> {
    const userId = await requireUserId()

    const { data, error } = await supabase
      .from('folders')
      .insert({
        user_id: userId,
        name,
      })
      .select('id, name, created_at, updated_at')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return mapFolderRow(data)
  },
  async update(id: string, input: { name: string }): Promise<FolderRecord> {
    await requireUserId()

    const { data, error } = await supabase
      .from('folders')
      .update({
        name: input.name,
      })
      .eq('id', id)
      .select('id, name, created_at, updated_at')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return mapFolderRow(data)
  },
  async delete(id: string): Promise<void> {
    await requireUserId()

    const { error } = await supabase.from('folders').delete().eq('id', id)

    if (error) {
      throw new Error(error.message)
    }
  },
}
