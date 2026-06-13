import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { uploadToCloudinary, isCloudinaryConfigured } from '../lib/cloudinary'

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

export interface ProjectCard {
  id: string
  name: string
  description: string
  tags: string[]
  githubUrl: string | null
  demoUrl: string | null
  screenshotUrl: string | null
  createdAt: string
  updatedAt: string
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
  // 项目卡片相关
  projects: ProjectCard[]
  projectsLoading: boolean
  projectsError: string | null

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
  // 项目卡片相关方法
  loadProjects: () => Promise<void>
  setCurrentProjectView: (view: 'grid' | 'list') => void
  currentProjectView: 'grid' | 'list'
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
      // 项目卡片状态
      projects: [],
      projectsLoading: false,
      projectsError: null,
      currentProjectView: 'grid',

      addImages: (files) => {
        const newImages: ImageItem[] = []
        Array.from(files).forEach((file, index) => {
          if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = async (e) => {
              const localSrc = e.target?.result as string
              
              let finalSrc = localSrc
              
              // 如果配置了 Cloudinary，上传到云端
              if (isCloudinaryConfigured()) {
                try {
                  const result = await uploadToCloudinary(file)
                  finalSrc = result.secure_url
                } catch (err) {
                  console.error('上传失败，使用本地存储:', err)
                }
              }
              
              const newImage: ImageItem = {
                id: generateId(),
                src: finalSrc,
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
      },

      // 加载项目列表
      loadProjects: async () => {
        set({ projectsLoading: true, projectsError: null })
        try {
          const rawProjects = await fetchProjects()
          const projects: ProjectCard[] = rawProjects.map((p: Project) => ({
            id: p.id,
            name: p.name,
            description: p.description,
            tags: p.tags || [],
            githubUrl: p.github_url,
            demoUrl: p.demo_url,
            screenshotUrl: p.screenshot_url,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          }))
          set({ projects, projectsLoading: false })
        } catch (error) {
          set({ 
            projectsError: error instanceof Error ? error.message : '加载项目失败',
            projectsLoading: false 
          })
        }
      },

      setCurrentProjectView: (view) => {
        set({ currentProjectView: view })
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
