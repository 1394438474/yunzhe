import { useCallback, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Grid3X3, Circle, LayoutList, Wallpaper, Clock, 
  Upload, Search, Trash2, Download, Play, Pause,
  Sun, Moon, FolderPlus, Image, CheckSquare, Square,
  X, ChevronLeft, ChevronRight, Star, Tag
} from 'lucide-react'
import { useStore, ImageItem } from '../stores/useStore'
import Gallery from './Gallery'
import './UI.css'

const viewIcons = {
  grid: Grid3X3,
  sphere: Circle,
  carousel: LayoutList,
  wall: Wallpaper,
  timeline: Clock
}

export default function UI() {
  const {
    images,
    selectedImages,
    currentView,
    searchQuery,
    isPlaying,
    theme,
    setView,
    setSearch,
    addImages,
    removeImages,
    selectAll,
    clearSelection,
    toggleSelect,
    toggleSlideshow,
    toggleSort,
    setTheme,
    toggleFavorite
  } = useStore()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showSidebar, setShowSidebar] = useState(false)
  const [modalIndex, setModalIndex] = useState(-1)
  const [dragging, setDragging] = useState(false)

  const filteredImages = images.filter(img => 
    img.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      addImages(e.dataTransfer.files)
    }
  }, [addImages])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragging(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addImages(e.target.files)
    }
  }

  const openModal = (index: number) => {
    setModalIndex(index)
  }

  const closeModal = () => {
    setModalIndex(-1)
  }

  const prevImage = () => {
    setModalIndex((prev) => 
      prev > 0 ? prev - 1 : filteredImages.length - 1
    )
  }

  const nextImage = () => {
    setModalIndex((prev) => 
      prev < filteredImages.length - 1 ? prev + 1 : 0
    )
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalIndex >= 0) {
        if (e.key === 'Escape') closeModal()
        if (e.key === 'ArrowLeft') prevImage()
        if (e.key === 'ArrowRight') nextImage()
      }
      if (e.key === 'Delete' && selectedImages.size > 0) {
        removeImages([...selectedImages])
      }
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        selectAll()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalIndex, selectedImages, filteredImages.length])

  useEffect(() => {
    if (isPlaying && filteredImages.length > 0) {
      const interval = setInterval(() => {
        setModalIndex((prev) => 
          prev < filteredImages.length - 1 ? prev + 1 : 0
        )
      }, 2500)
      return () => clearInterval(interval)
    }
  }, [isPlaying, filteredImages.length])

  return (
    <div className="ui">
      {/* Header */}
      <header className="header glass">
        <div className="logo">
          <span className="logo-icon">◆</span>
          <span>NEXUS IMAGE LAB</span>
        </div>
        
        <div className="search-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input input"
            placeholder="搜索图片..."
            value={searchQuery}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="header-actions">
          <button 
            className="icon-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={theme === 'dark' ? '亮色模式' : '暗色模式'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            className="icon-btn"
            onClick={() => setShowSidebar(!showSidebar)}
            title="管理图片"
          >
            <FolderPlus size={20} />
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="sidebar glass"
          >
            <div className="sidebar-header">
              <h3>图片管理</h3>
              <button className="icon-btn" onClick={() => setShowSidebar(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="sidebar-stats">
              <div className="stat">
                <Image size={16} />
                <span>{images.length}</span>
              </div>
              <div className="stat">
                <CheckSquare size={16} />
                <span>{selectedImages.size}</span>
              </div>
            </div>
            <div className="sidebar-actions">
              <button className="btn" onClick={selectAll}>
                {selectedImages.size === images.length ? '取消全选' : '全选'}
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => removeImages([...selectedImages])}
                disabled={selectedImages.size === 0}
              >
                <Trash2 size={16} />
                删除
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Nav */}
      <nav className="nav">
        {(Object.keys(viewIcons) as Array<keyof typeof viewIcons>).map((view) => {
          const Icon = viewIcons[view]
          return (
            <button
              key={view}
              className={`nav-btn ${currentView === view ? 'active' : ''}`}
              onClick={() => setView(view)}
              title={view}
            >
              <Icon size={20} />
            </button>
          )
        })}
      </nav>

      {/* Gallery */}
      <main className="gallery-container">
        <Gallery 
          images={filteredImages} 
          view={currentView}
          onSelect={toggleSelect}
          onOpen={openModal}
          selectedImages={selectedImages}
        />
      </main>

      {/* Upload Zone */}
      <div
        className={`upload-zone glass ${dragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload size={24} />
        <span>拖拽图片或点击上传</span>
        <span className="hint">支持 JPG / PNG / WebP</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {/* Controls */}
      <div className="controls glass">
        <button className={`btn ${isPlaying ? 'active' : ''}`} onClick={toggleSlideshow}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isPlaying ? '暂停' : '幻灯片'}
        </button>
        <button className="btn" onClick={toggleSort}>
          排序
        </button>
        <button className="btn" onClick={() => selectAll()}>
          {selectedImages.size === images.length ? '取消全选' : '全选'}
        </button>
        <button 
          className="btn btn-danger"
          onClick={() => removeImages([...selectedImages])}
          disabled={selectedImages.size === 0}
        >
          <Trash2 size={16} />
          删除
        </button>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalIndex >= 0 && filteredImages[modalIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close" onClick={closeModal}>
                <X size={24} />
              </button>
              <button className="modal-nav prev" onClick={prevImage}>
                <ChevronLeft size={32} />
              </button>
              <img 
                src={filteredImages[modalIndex].src} 
                alt={filteredImages[modalIndex].name}
              />
              <button className="modal-nav next" onClick={nextImage}>
                <ChevronRight size={32} />
              </button>
              <div className="modal-info">
                <span>{filteredImages[modalIndex].name}</span>
                <button 
                  className="icon-btn"
                  onClick={() => toggleFavorite(filteredImages[modalIndex].id)}
                >
                  <Star 
                    size={20} 
                    fill={filteredImages[modalIndex].favorite ? '#ff0' : 'none'}
                    color={filteredImages[modalIndex].favorite ? '#ff0' : 'currentColor'}
                  />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
    </div>
  )
}
