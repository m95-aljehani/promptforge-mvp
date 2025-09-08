import { Prompt, Revision, Tag, Folder } from '@/types'

// IndexedDB wrapper for local storage
class LocalStorage {
  private dbName = 'promptforge'
  private version = 1
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores
        if (!db.objectStoreNames.contains('prompts')) {
          const promptStore = db.createObjectStore('prompts', { keyPath: 'id' })
          promptStore.createIndex('user_id', 'user_id', { unique: false })
          promptStore.createIndex('folder_id', 'folder_id', { unique: false })
          promptStore.createIndex('is_pinned', 'is_pinned', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('revisions')) {
          const revisionStore = db.createObjectStore('revisions', { keyPath: 'id' })
          revisionStore.createIndex('prompt_id', 'prompt_id', { unique: false })
        }
        
        if (!db.objectStoreNames.contains('tags')) {
          db.createObjectStore('tags', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('folders')) {
          db.createObjectStore('folders', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('prompt_tags')) {
          const promptTagStore = db.createObjectStore('prompt_tags', { keyPath: ['prompt_id', 'tag_id'] })
          promptTagStore.createIndex('prompt_id', 'prompt_id', { unique: false })
          promptTagStore.createIndex('tag_id', 'tag_id', { unique: false })
        }
      }
    })
  }

  async getPrompts(userId: string): Promise<Prompt[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['prompts'], 'readonly')
      const store = transaction.objectStore('prompts')
      const index = store.index('user_id')
      const request = index.getAll(userId)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async savePrompt(prompt: Prompt): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['prompts'], 'readwrite')
      const store = transaction.objectStore('prompts')
      const request = store.put(prompt)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async deletePrompt(id: string): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['prompts'], 'readwrite')
      const store = transaction.objectStore('prompts')
      const request = store.delete(id)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getRevisions(promptId: string): Promise<Revision[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['revisions'], 'readonly')
      const store = transaction.objectStore('revisions')
      const index = store.index('prompt_id')
      const request = index.getAll(promptId)
      
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async saveRevision(revision: Revision): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['revisions'], 'readwrite')
      const store = transaction.objectStore('revisions')
      const request = store.put(revision)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getTags(userId: string): Promise<Tag[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tags'], 'readonly')
      const store = transaction.objectStore('tags')
      const request = store.getAll()
      
      request.onsuccess = () => {
        const tags = request.result.filter((tag: Tag) => tag.user_id === userId)
        resolve(tags)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async saveTag(tag: Tag): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['tags'], 'readwrite')
      const store = transaction.objectStore('tags')
      const request = store.put(tag)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getFolders(userId: string): Promise<Folder[]> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['folders'], 'readonly')
      const store = transaction.objectStore('folders')
      const request = store.getAll()
      
      request.onsuccess = () => {
        const folders = request.result.filter((folder: Folder) => folder.user_id === userId)
        resolve(folders)
      }
      request.onerror = () => reject(request.error)
    })
  }

  async saveFolder(folder: Folder): Promise<void> {
    if (!this.db) await this.init()
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['folders'], 'readwrite')
      const store = transaction.objectStore('folders')
      const request = store.put(folder)
      
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}

export const localStorage = new LocalStorage()