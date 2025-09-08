import React, { createContext, useContext, useEffect, useState } from 'react'
import { Prompt, Revision, Tag, Folder } from '@/types'
import { useAuth } from './AuthContext'
import { localStorage } from '@/lib/storage'
import { supabase } from '@/lib/supabase'
import { generateId } from '@/lib/crypto'

interface PromptContextType {
  prompts: Prompt[]
  folders: Folder[]
  tags: Tag[]
  loading: boolean
  createPrompt: (title: string, body: string, folderId?: string) => Promise<Prompt>
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<void>
  deletePrompt: (id: string) => Promise<void>
  createRevision: (promptId: string, body: string, command?: string, provider?: string, tokenUsage?: number) => Promise<Revision>
  createFolder: (name: string) => Promise<Folder>
  createTag: (name: string, color?: string) => Promise<Tag>
  togglePin: (id: string) => Promise<void>
  addTagToPrompt: (promptId: string, tagId: string) => Promise<void>
  removeTagFromPrompt: (promptId: string, tagId: string) => Promise<void>
  searchPrompts: (query: string) => Prompt[]
}

const PromptContext = createContext<PromptContextType | undefined>(undefined)

export function usePrompts() {
  const context = useContext(PromptContext)
  if (context === undefined) {
    throw new Error('usePrompts must be used within a PromptProvider')
  }
  return context
}

export function PromptProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [prompts, setPrompts] = useState<Prompt[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadData()
    } else {
      setPrompts([])
      setFolders([])
      setTags([])
      setLoading(false)
    }
  }, [user])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Load from local storage first
      const [localPrompts, localFolders, localTags] = await Promise.all([
        localStorage.getPrompts(user.id),
        localStorage.getFolders(user.id),
        localStorage.getTags(user.id)
      ])

      setPrompts(localPrompts)
      setFolders(localFolders)
      setTags(localTags)

      // Then sync with Supabase if available
      try {
        const { data: cloudPrompts } = await supabase
          .from('prompts')
          .select('*')
          .eq('user_id', user.id)
          .order('updated_at', { ascending: false })

        if (cloudPrompts) {
          setPrompts(cloudPrompts)
          // Save to local storage
          cloudPrompts.forEach(prompt => localStorage.savePrompt(prompt))
        }
      } catch (error) {
        console.log('Cloud sync not available, using local storage only')
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createPrompt = async (title: string, body: string, folderId?: string): Promise<Prompt> => {
    if (!user) throw new Error('User not authenticated')

    const prompt: Prompt = {
      id: generateId(),
      user_id: user.id,
      folder_id: folderId,
      title,
      body_md: body,
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Save locally
    await localStorage.savePrompt(prompt)
    setPrompts(prev => [prompt, ...prev])

    // Try to save to cloud
    try {
      await supabase.from('prompts').insert(prompt)
    } catch (error) {
      console.log('Cloud save failed, saved locally only')
    }

    return prompt
  }

  const updatePrompt = async (id: string, updates: Partial<Prompt>) => {
    const updatedPrompt = {
      ...prompts.find(p => p.id === id)!,
      ...updates,
      updated_at: new Date().toISOString()
    }

    await localStorage.savePrompt(updatedPrompt)
    setPrompts(prev => prev.map(p => p.id === id ? updatedPrompt : p))

    try {
      await supabase.from('prompts').update(updates).eq('id', id)
    } catch (error) {
      console.log('Cloud update failed, updated locally only')
    }
  }

  const deletePrompt = async (id: string) => {
    await localStorage.deletePrompt(id)
    setPrompts(prev => prev.filter(p => p.id !== id))

    try {
      await supabase.from('prompts').delete().eq('id', id)
    } catch (error) {
      console.log('Cloud delete failed, deleted locally only')
    }
  }

  const createRevision = async (
    promptId: string, 
    body: string, 
    command?: string, 
    provider?: string, 
    tokenUsage?: number
  ): Promise<Revision> => {
    const revision: Revision = {
      id: generateId(),
      prompt_id: promptId,
      body_md: body,
      command_text: command,
      llm_provider: provider || 'openai',
      token_usage: tokenUsage,
      created_at: new Date().toISOString()
    }

    await localStorage.saveRevision(revision)

    try {
      await supabase.from('revisions').insert(revision)
    } catch (error) {
      console.log('Cloud save failed, saved locally only')
    }

    return revision
  }

  const createFolder = async (name: string): Promise<Folder> => {
    if (!user) throw new Error('User not authenticated')

    const folder: Folder = {
      id: generateId(),
      user_id: user.id,
      name,
      created_at: new Date().toISOString()
    }

    await localStorage.saveFolder(folder)
    setFolders(prev => [...prev, folder])

    try {
      await supabase.from('folders').insert(folder)
    } catch (error) {
      console.log('Cloud save failed, saved locally only')
    }

    return folder
  }

  const createTag = async (name: string, color?: string): Promise<Tag> => {
    if (!user) throw new Error('User not authenticated')

    const tag: Tag = {
      id: generateId(),
      user_id: user.id,
      name,
      color
    }

    await localStorage.saveTag(tag)
    setTags(prev => [...prev, tag])

    try {
      await supabase.from('tags').insert(tag)
    } catch (error) {
      console.log('Cloud save failed, saved locally only')
    }

    return tag
  }

  const togglePin = async (id: string) => {
    const prompt = prompts.find(p => p.id === id)
    if (!prompt) return

    await updatePrompt(id, { is_pinned: !prompt.is_pinned })
  }

  const addTagToPrompt = async (promptId: string, tagId: string) => {
    try {
      await supabase.from('prompt_tags').insert({ prompt_id: promptId, tag_id: tagId })
    } catch (error) {
      console.log('Cloud save failed for tag association')
    }
  }

  const removeTagFromPrompt = async (promptId: string, tagId: string) => {
    try {
      await supabase.from('prompt_tags').delete().match({ prompt_id: promptId, tag_id: tagId })
    } catch (error) {
      console.log('Cloud delete failed for tag association')
    }
  }

  const searchPrompts = (query: string): Prompt[] => {
    if (!query.trim()) return prompts

    const lowercaseQuery = query.toLowerCase()
    return prompts.filter(prompt => 
      prompt.title.toLowerCase().includes(lowercaseQuery) ||
      prompt.body_md.toLowerCase().includes(lowercaseQuery)
    )
  }

  const value = {
    prompts,
    folders,
    tags,
    loading,
    createPrompt,
    updatePrompt,
    deletePrompt,
    createRevision,
    createFolder,
    createTag,
    togglePin,
    addTagToPrompt,
    removeTagFromPrompt,
    searchPrompts
  }

  return <PromptContext.Provider value={value}>{children}</PromptContext.Provider>
}