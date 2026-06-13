import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Github, ExternalLink, ImageOff } from 'lucide-react'
import { useStore, ProjectCard } from '../stores/useStore'
import './ProjectCards.css'

// ASCII占位图
const ASCII_PLACEHOLDER = `┌─────────────────────────────┐
│                             │
│     ████  ████  ████        │
│     █  █  █  █  █  █        │
│     ████  ████  ████        │
│                             │
│   ╔═══════════════════╗      │
│   ║   N O   I M A G E║      │
│   ╚═══════════════════╝      │
│                             │
└─────────────────────────────┘`

export default function ProjectCards() {
  const { 
    projects, 
    projectsLoading, 
    projectsError, 
    loadProjects,
    currentProjectView 
  } = useStore()

  useEffect(() => {
    if (projects.length === 0) {
      loadProjects()
    }
  }, [])

  if (projectsLoading) {
    return (
      <div className="project-cards-loading">
        <div className="loading-spinner" />
        <span>加载项目...</span>
      </div>
    )
  }

  if (projectsError) {
    return (
      <div className="project-cards-error">
        <span>加载失败: {projectsError}</span>
        <button onClick={loadProjects}>重试</button>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="project-cards-empty">
        <span>暂无项目</span>
      </div>
    )
  }

  return (
    <div className={`project-cards ${currentProjectView}`}>
      {projects.map((project, index) => (
        <ProjectCardItem key={project.id} project={project} index={index} />
      ))}
    </div>
  )
}

function ProjectCardItem({ project, index }: { project: ProjectCard; index: number }) {
  const [imageError, setImageError] = useState(false)
  const hasScreenshot = project.screenshotUrl && !imageError

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <motion.div
      className="project-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="card-screenshot">
        {hasScreenshot ? (
          <img 
            src={project.screenshotUrl!} 
            alt={project.name}
            onError={handleImageError}
          />
        ) : (
          <div className="ascii-placeholder">
            <pre>{ASCII_PLACEHOLDER}</pre>
          </div>
        )}
      </div>

      <div className="card-content">
        <h3 className="card-title">{project.name}</h3>
        <p className="card-description">{project.description}</p>
        
        <div className="card-tags">
          {project.tags.map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        <div className="card-links">
          {project.githubUrl && (
            <a 
              href={project.githubUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="card-link"
              title="GitHub"
            >
              <Github size={18} />
              <span>源码</span>
            </a>
          )}
          {project.demoUrl && (
            <a 
              href={project.demoUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="card-link"
              title="Demo"
            >
              <ExternalLink size={18} />
              <span>演示</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  )
}
