import React, { useState } from 'react'
import { Plus, Folder, Pin, Tag, ChevronRight, ChevronDown } from 'lucide-react'
import { usePrompts } from '@/contexts/PromptContext'

interface SidebarProps {
  onCreateNew: () => void
  selectedFolder: string | null
  onSelectFolder: (folderId: string | null) => void
}

export function Sidebar({ onCreateNew, selectedFolder, onSelectFolder }: SidebarProps) {
  const { prompts, folders, tags, createFolder } = usePrompts()
  const [showFolders, setShowFolders] = useState(true)
  const [showTags, setShowTags] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)

  const pinnedPrompts = prompts.filter(p => p.is_pinned)

  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim())
      setNewFolderName('')
      setIsCreatingFolder(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateFolder()
    } else if (e.key === 'Escape') {
      setIsCreatingFolder(false)
      setNewFolderName('')
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4">
        <button
          onClick={onCreateNew}
          className="w-full btn-primary flex items-center justify-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Prompt</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Pinned Prompts */}
        {pinnedPrompts.length > 0 && (
          <div className="px-4 py-2">
            <div className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
              <Pin className="w-4 h-4" />
              <span>Pinned</span>
            </div>
            <div className="space-y-1">
              {pinnedPrompts.map(prompt => (
                <div
                  key={prompt.id}
                  className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer truncate"
                >
                  {prompt.title}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Folders */}
        <div className="px-4 py-2">
          <button
            onClick={() => setShowFolders(!showFolders)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2 w-full"
          >
            {showFolders ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Folder className="w-4 h-4" />
            <span>Folders</span>
          </button>

          {showFolders && (
            <div className="space-y-1 ml-6">
              <button
                onClick={() => onSelectFolder(null)}
                className={`text-sm w-full text-left hover:text-gray-900 ${
                  selectedFolder === null ? 'text-primary-600 font-medium' : 'text-gray-600'
                }`}
              >
                All Prompts ({prompts.length})
              </button>

              {folders.map(folder => {
                const folderPrompts = prompts.filter(p => p.folder_id === folder.id)
                return (
                  <button
                    key={folder.id}
                    onClick={() => onSelectFolder(folder.id)}
                    className={`text-sm w-full text-left hover:text-gray-900 ${
                      selectedFolder === folder.id ? 'text-primary-600 font-medium' : 'text-gray-600'
                    }`}
                  >
                    {folder.name} ({folderPrompts.length})
                  </button>
                )
              })}

              {isCreatingFolder ? (
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  onBlur={handleCreateFolder}
                  placeholder="Folder name"
                  className="text-sm w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>New Folder</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="px-4 py-2">
          <button
            onClick={() => setShowTags(!showTags)}
            className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2 w-full"
          >
            {showTags ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <Tag className="w-4 h-4" />
            <span>Tags</span>
          </button>

          {showTags && (
            <div className="space-y-1 ml-6">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer flex items-center space-x-2"
                >
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: tag.color || '#6b7280' }}
                  />
                  <span>{tag.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}