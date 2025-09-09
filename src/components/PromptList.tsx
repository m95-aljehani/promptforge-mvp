import React from 'react'
import { Pin, Clock, MoreVertical } from 'lucide-react'
import { Prompt } from '@/types'
import { formatDate, truncateText, extractMarkdownContent } from '@/lib/utils'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { usePrompts } from '@/contexts/PromptContext'

interface PromptListProps {
  prompts: Prompt[]
  selectedPrompt: Prompt | null
  onSelectPrompt: (prompt: Prompt) => void
  loading: boolean
}

export function PromptList({ prompts, selectedPrompt, onSelectPrompt, loading }: PromptListProps) {
  const { togglePin, deletePrompt } = usePrompts()

  const handleTogglePin = async (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation()
    await togglePin(promptId)
  }

  const handleDelete = async (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation()
    if (confirm('Are you sure you want to delete this prompt?')) {
      await deletePrompt(promptId)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (prompts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="mb-2">No prompts found</p>
          <p className="text-sm">Create your first prompt to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Prompts ({prompts.length})
        </h2>
        
        <div className="space-y-3">
          {prompts.map(prompt => {
            const isSelected = selectedPrompt?.id === prompt.id
            const preview = extractMarkdownContent(prompt.body_md)
            
            return (
              <div
                key={prompt.id}
                onClick={() => onSelectPrompt(prompt)}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  isSelected 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 flex-1 mr-2">
                    {truncateText(prompt.title, 50)}
                  </h3>
                  
                  <div className="flex items-center space-x-1">
                    {prompt.is_pinned && (
                      <Pin className="w-4 h-4 text-primary-600" />
                    )}
                    
                    <div className="relative group">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        <button
                          onClick={(e) => handleTogglePin(e, prompt.id)}
                          className="w-full px-3 py-1 text-left text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {prompt.is_pinned ? 'Unpin' : 'Pin'}
                        </button>
                        <button
                          onClick={(e) => handleDelete(e, prompt.id)}
                          className="w-full px-3 py-1 text-left text-sm text-red-600 hover:bg-gray-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {truncateText(preview, 120)}
                </p>
                
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>{formatDate(prompt.updated_at)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}