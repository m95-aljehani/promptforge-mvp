import React, { useState } from 'react'
import { Sidebar } from './Sidebar'
import { PromptList } from './PromptList'
import { PromptEditor } from './PromptEditor'
import { Header } from './Header'
import { usePrompts } from '@/contexts/PromptContext'
import { Prompt } from '@/types'

export function Dashboard() {
  const { prompts, loading } = usePrompts()
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)

  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = !searchQuery || 
      prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.body_md.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFolder = !selectedFolder || prompt.folder_id === selectedFolder
    
    return matchesSearch && matchesFolder
  })

  const handleCreateNew = () => {
    setSelectedPrompt(null)
    setIsCreating(true)
  }

  const handleSelectPrompt = (prompt: Prompt) => {
    setSelectedPrompt(prompt)
    setIsCreating(false)
  }

  const handleCloseEditor = () => {
    setSelectedPrompt(null)
    setIsCreating(false)
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar 
        onCreateNew={handleCreateNew}
        selectedFolder={selectedFolder}
        onSelectFolder={setSelectedFolder}
      />
      
      <div className="flex-1 flex flex-col">
        <Header 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <div className="flex-1 flex">
          <div className="w-1/3 border-r border-gray-200 bg-white">
            <PromptList 
              prompts={filteredPrompts}
              selectedPrompt={selectedPrompt}
              onSelectPrompt={handleSelectPrompt}
              loading={loading}
            />
          </div>
          
          <div className="flex-1 bg-white">
            {(selectedPrompt || isCreating) ? (
              <PromptEditor 
                prompt={selectedPrompt}
                onClose={handleCloseEditor}
                isCreating={isCreating}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <h3 className="text-lg font-medium mb-2">Welcome to PromptForge</h3>
                  <p className="mb-4">Select a prompt to edit or create a new one</p>
                  <button 
                    onClick={handleCreateNew}
                    className="btn-primary"
                  >
                    Create New Prompt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}