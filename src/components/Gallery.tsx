import { useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ImageItem, useStore } from '../stores/useStore'
import './Gallery.css'

interface GalleryProps {
  images: ImageItem[]
  view: 'grid' | 'sphere' | 'carousel' | 'wall' | 'timeline'
  onSelect: (id: string) => void
  onOpen: (index: number) => void
  selectedImages: Set<string>
}

export default function Gallery({ images, view, onSelect, onOpen, selectedImages }: GalleryProps) {
  const { sortOrder, toggleFavorite } = useStore()

  const sortedImages = useMemo(() => {
    return [...images].sort((a, b) => {
      return sortOrder === 'asc' 
        ? a.date.localeCompare(b.date) 
        : b.date.localeCompare(a.date)
    })
  }, [images, sortOrder])

  if (sortedImages.length === 0) {
    return (
      <div className="gallery-empty">
        <div className="empty-icon">🖼️</div>
        <p>暂无图片</p>
        <span>上传图片开始体验</span>
      </div>
    )
  }

  if (view === 'sphere') {
    return <SphereView images={sortedImages} onOpen={onOpen} onFavorite={toggleFavorite} />
  }

  if (view === 'carousel') {
    return <CarouselView images={sortedImages} onOpen={onOpen} onFavorite={toggleFavorite} />
  }

  if (view === 'wall') {
    return <WallView images={sortedImages} onSelect={onSelect} onOpen={onOpen} selectedImages={selectedImages} onFavorite={toggleFavorite} />
  }

  return <GridView images={sortedImages} onSelect={onSelect} onOpen={onOpen} selectedImages={selectedImages} onFavorite={toggleFavorite} />
}

function GridView({ images, onSelect, onOpen, selectedImages, onFavorite }: GalleryProps) {
  return (
    <div className="gallery-grid scrollbar">
      {images.map((img, index) => (
        <motion.div
          key={img.id}
          className={`gallery-item ${selectedImages.has(img.id) ? 'selected' : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              onSelect(img.id)
            } else {
              onOpen(index)
            }
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            onSelect(img.id)
          }}
        >
          <div className="item-glow" />
          <img src={img.src} alt={img.name} loading="lazy" />
          <div className="item-overlay">
            <input
              type="checkbox"
              checked={selectedImages.has(img.id)}
              onChange={() => onSelect(img.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <span>{img.name}</span>
            <button 
              className="favorite-btn"
              onClick={(e) => {
                e.stopPropagation()
                onFavorite(img.id)
              }}
            >
              {img.favorite ? '★' : '☆'}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function WallView({ images, onSelect, onOpen, selectedImages, onFavorite }: GalleryProps) {
  return (
    <div className="gallery-wall scrollbar">
      {images.map((img, index) => (
        <motion.div
          key={img.id}
          className={`wall-item ${selectedImages.has(img.id) ? 'selected' : ''}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 }}
          style={{
            gridRowEnd: `span ${Math.floor(Math.random() * 3) + 1}`
          }}
          onClick={(e) => {
            if (e.ctrlKey || e.metaKey) {
              onSelect(img.id)
            } else {
              onOpen(index)
            }
          }}
        >
          <img src={img.src} alt={img.name} loading="lazy" />
          <div className="wall-overlay">
            <button 
              className="favorite-btn"
              onClick={(e) => {
                e.stopPropagation()
                onFavorite(img.id)
              }}
            >
              {img.favorite ? '★' : '☆'}
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function SphereView({ images, onOpen, onFavorite }: { images: ImageItem[], onOpen: (i: number) => void, onFavorite: (id: string) => void }) {
  const sphereRef = useRef<HTMLDivElement>(null)
  
  const positions = useMemo(() => {
    const n = images.length || 20
    return images.map((_, i) => {
      const phi = Math.acos(-1 + (2 * i) / n)
      const theta = Math.sqrt(n * Math.PI) * phi
      const r = 250
      return {
        x: r * Math.cos(theta) * Math.sin(phi),
        y: r * Math.cos(phi),
        z: r * Math.sin(theta) * Math.sin(phi),
        rotX: phi * (180 / Math.PI),
        rotY: theta * (180 / Math.PI)
      }
    })
  }, [images])

  return (
    <div className="gallery-sphere" ref={sphereRef}>
      <div className="sphere-container">
        {images.map((img, i) => (
          <motion.div
            key={img.id}
            className="sphere-item"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              transform: `translate3d(${positions[i].x}px, ${positions[i].y}px, ${positions[i].z}px) rotateY(${positions[i].rotY}deg) rotateX(${positions[i].rotX}deg)`
            }}
            onClick={() => onOpen(i)}
          >
            <img src={img.src} alt={img.name} />
            <button 
              className="sphere-favorite"
              onClick={(e) => {
                e.stopPropagation()
                onFavorite(img.id)
              }}
            >
              {img.favorite ? '★' : '☆'}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function CarouselView({ images, onOpen, onFavorite }: { images: ImageItem[], onOpen: (i: number) => void, onFavorite: (id: string) => void }) {
  return (
    <div className="gallery-carousel">
      <div className="carousel-track">
        {images.map((img, index) => (
          <motion.div
            key={img.id}
            className="carousel-item"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onOpen(index)}
          >
            <img src={img.src} alt={img.name} />
            <div className="carousel-info">
              <span>{img.name}</span>
              <button 
                className="favorite-btn"
                onClick={(e) => {
                  e.stopPropagation()
                  onFavorite(img.id)
                }}
              >
                {img.favorite ? '★' : '☆'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
