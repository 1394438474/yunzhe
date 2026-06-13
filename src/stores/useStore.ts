import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ImageItem {
  id: string
  src: string
  name: string
  size: number
  date: string
  tags: string[]
  favorite: boolean
  folderId: string | null
}

export interface Folder {
  id: string
  name: string
  parentId: string | null
}

export type ViewMode = 'grid' | 'sphere' | 'carousel' | 'wall' | 'timeline'

interface AppState {
  images: ImageItem[]
  folders: Folder[]
  selectedImages: Set<string>
  currentView: ViewMode
  searchQuery: string
  isLoading: boolean
  isPlaying: boolean
  sortOrder: 'asc' | 'desc'
  theme: 'dark' | 'light'
  
  addImages: (files: FileList) => void
  removeImages: (ids: string[]) => void
  toggleSelect: (id: string) => void
  selectAll: () => void
  clearSelection: () => void
  setView: (view: ViewMode) => void
  setSearch: (query: string) => void
  toggleFavorite: (id: string) => void
  addFolder: (name: string, parentId?: string | null) => void
  removeFolder: (id: string) => void
  moveToFolder: (imageIds: string[], folderId: string | null) => void
  toggleSlideshow: () => void
  toggleSort: () => void
  setTheme: (theme: 'dark' | 'light') => void
  updateImageTags: (id: string, tags: string[]) => void
}

const generateId = () => Math.random().toString(36).substring(2, 15)

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      images: [],
      folders: [],
      selectedImages: new Set(),
      currentView: 'grid',
      searchQuery: '',
      isLoading: false,
      isPlaying: false,
      sortOrder: 'desc',
      theme: 'dark',

      addImages: (files) => {
        const newImages: ImageItem[] = []
        Array.from(files).forEach((file, index) => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = (e) => {
              const src = e.target?.result as string
              const newImage: ImageItem = {
                id: generateId(),
                src,
                name: file.name,
                size: file.size / 1024 / 1024,
                date: new Date().toISOString(),
                tags: [],
                favorite: false,
                folderId: null
              }
              set((state) => ({
                images: [...state.images, newImage]
              }))
            }
            reader.readAsDataURL(file)
          }
        })
      },

      removeImages: (ids) => {
        set((state) => ({
          images: state.images.filter((img) => !ids.includes(img.id)),
          selectedImages: new Set(
            [...state.selectedImages].filter((id) => !ids.includes(id))
          )
        }))
      },

      toggleSelect: (id) => {
        set((state) => {
          const newSelected = new Set(state.selectedImages)
          if (newSelected.has(id)) {
            newSelected.delete(id)
          } else {
            newSelected.add(id)
          }
          return { selectedImages: newSelected }
        })
      },

      selectAll: () => {
        const allIds = get().images.map((img) => img.id)
        set({ selectedImages: new Set(allIds) })
      },

      clearSelection: () => {
        set({ selectedImages: new Set() })
      },

      setView: (view) => {
        set({ currentView: view })
      },

      setSearch: (query) => {
        set({ searchQuery: query })
      },

      toggleFavorite: (id) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, favorite: !img.favorite } : img
          )
        }))
      },

      addFolder: (name, parentId = null) => {
        const newFolder: Folder = {
          id: generateId(),
          name,
          parentId
        }
        set((state) => ({ folders: [...state.folders, newFolder] }))
      },

      removeFolder: (id) => {
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          images: state.images.map((img) =>
            img.folderId === id ? { ...img, folderId: null } : img
          )
        }))
      },

      moveToFolder: (imageIds, folderId) => {
        set((state) => ({
          images: state.images.map((img) =>
            imageIds.includes(img.id) ? { ...img, folderId } : img
          )
        }))
      },

      toggleSlideshow: () => {
        set((state) => ({ isPlaying: !state.isPlaying }))
      },

      toggleSort: () => {
        set((state) => ({
          sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc'
        }))
      },

      setTheme: (theme) => {
        set({ theme })
      },

      updateImageTags: (id, tags) => {
        set((state) => ({
          images: state.images.map((img) =>
            img.id === id ? { ...img, tags } : img
          )
        }))
      }
    }),
    {
      name: 'nexus-image-lab-storage',
      partialize: (state) => ({
        images: state.images.slice(0, 50),
        folders: state.folders,
        theme: state.theme,
        sortOrder: state.sortOrder
      })
    }
  )
)
