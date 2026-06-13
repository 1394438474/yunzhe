import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import './Loading.css'

export default function Loading() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!loading) return null

  return (
    <motion.div 
      className="loading-screen"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="loading-ring" />
      <div className="loading-text">初始化引擎...</div>
    </motion.div>
  )
}
