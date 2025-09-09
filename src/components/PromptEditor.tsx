import React, { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Save, Sparkles, X, Clock, Zap } from 'lucide-react'
import { Prompt, Revision } from '@/types'
import { usePrompts } from '@/contexts/PromptContext'
import { LoadingSpinner } from './ui/LoadingSpinner'
import { formatDate, parseSlashCommand } from '@/lib/utils'

interface PromptEditorProps {
  prompt: Prompt | null
  onClose: () => void
  isCreating: boolean
}

export function PromptEditor({ prompt, onClose, isCreating }: PromptEditorProps) {
  const { createPrompt, updatePrompt, createRevision } = usePrompts()
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)
  const [refining, setRefining] = useState(false)
  const [revisions, setRevisions] = useState<Revision[]>([])

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (prompt) {
      setTitle(prompt.title)
      editor?.commands.setContent(prompt.body_md)
      // Load revisions for this prompt
      loadRevisions(prompt.id)
    } else if (isCreating) {
      setTitle('')
      editor?.commands.setContent('')
      setRevisions([])
    }
  }, [prompt, isCreating, editor])

  const loadRevisions = async (promptId: string) => {
    // In a real app, this would load from the database
    // For now, we'll just show empty revisions
    setRevisions([])
  }

  const handleSave = async () => {
    if (!editor || !title.trim()) return

    setSaving(true)
    try {
      const content = editor.getHTML()
      
      if (isCreating) {
        await createPrompt(title, content)
        onClose()
      } else if (prompt) {
        await updatePrompt(prompt.id, {
          title,
          body_md: content
        })
      }
    } catch (error) {
      console.error('Error saving prompt:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleRefine = async () => {
    if (!editor || !prompt) return

    setRefining(true)
    try {
      const content = editor.getHTML()
      
      // Mock AI refinement - in real app, this would call the /refine API
      const refinedContent = await mockRefinePrompt(content)
      
      // Create a revision
      const revision = await createRevision(
        prompt.id,
        refinedContent,
        'enhance',
        'openai',
        150 // mock token usage
      )
      
      setRevisions(prev => [revision, ...prev])
    } catch (error) {
      console.error('Error refining prompt:', error)
    } finally {
      setRefining(false)
    }
  }

  const handleSlashCommand = (text: string) => {
    const command = parseSlashCommand(text)
    if (!command || !editor || !prompt) return

    if (command.command === 'enhance') {
      handleRefine()
    } else if (command.command === 'shorten') {
      const length = parseInt(command.args[0]) || 100
      handleShortenPrompt(length)
    }
  }

  const handleShortenPrompt = async (maxLength: number) => {
    if (!editor || !prompt) return

    setRefining(true)
    try {
      const content = editor.getHTML()
      const shortenedContent = await mockShortenPrompt(content, maxLength)
      
      const revision = await createRevision(
        prompt.id,
        shortenedContent,
        `shorten ${maxLength}`,
        'openai',
        80
      )
      
      setRevisions(prev => [revision, ...prev])
    } catch (error) {
      console.error('Error shortening prompt:', error)
    } finally {
      setRefining(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave()
    }
  }

  if (!editor) {
    return (
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Prompt title..."
            className="text-xl font-semibold bg-transparent border-none outline-none flex-1 mr-4"
            onKeyDown={handleKeyDown}
          />
          
          <div className="flex items-center space-x-2">
            {prompt && (
              <button
                onClick={handleRefine}
                disabled={refining}
                className="btn-secondary flex items-center space-x-2"
              >
                {refining ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Refine</span>
              </button>
            )}
            
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="btn-primary flex items-center space-x-2"
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Save</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Use <code>/enhance</code> or <code>/shorten N</code> commands for AI assistance
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex">
        <div className="flex-1 p-4">
          <div className="border border-gray-200 rounded-lg min-h-[400px]">
            <EditorContent 
              editor={editor} 
              className="h-full"
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        {/* Revisions Sidebar */}
        {revisions.length > 0 && (
          <div className="w-80 border-l border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Revisions</span>
            </h3>
            
            <div className="space-y-4">
              {revisions.map(revision => (
                <div key={revision.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Zap className="w-3 h-3" />
                      <span>{revision.llm_provider}</span>
                      {revision.command_text && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                          /{revision.command_text}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {revision.token_usage} tokens
                    </span>
                  </div>
                  
                  <div 
                    className="text-sm text-gray-700 mb-2 max-h-32 overflow-y-auto"
                    dangerouslySetInnerHTML={{ __html: revision.body_md }}
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatDate(revision.created_at)}
                    </span>
                    <button
                      onClick={() => editor.commands.setContent(revision.body_md)}
                      className="text-xs text-primary-600 hover:text-primary-700"
                    >
                      Use this version
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock functions - in real app, these would call the API
async function mockRefinePrompt(content: string): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay
  
  return `<h2>Enhanced Prompt</h2>
<p>This is an AI-enhanced version of your original prompt with improved clarity, structure, and effectiveness.</p>
<p><strong>Original content:</strong> ${content}</p>
<p><strong>Improvements made:</strong></p>
<ul>
<li>Added clearer structure and formatting</li>
<li>Enhanced specificity and context</li>
<li>Improved actionability and measurable outcomes</li>
</ul>`
}

async function mockShortenPrompt(content: string, maxLength: number): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const shortened = content.substring(0, maxLength)
  return `<p><strong>Shortened version (${maxLength} chars):</strong></p>
<p>${shortened}...</p>
<p><em>Content has been condensed while preserving key information.</em></p>`
}