import { useState } from 'react'
import Scene from './components/Scene'
import UI from './components/UI'
import Loading from './components/Loading'
import ProjectCards from './components/ProjectCards'
import './App.css'

type AppView = 'gallery' | 'projects'

const PASSWORD = '060804'

function App() {
  const [view, setView] = useState<AppView>('gallery')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [error, setError] = useState(false)

  const handleLogin = () => {
    if (passwordInput === PASSWORD) {
      setIsAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin()
    }
  }

  // 密码验证界面
  if (!isAuthenticated) {
    return (
      <div className="login-screen">
        <div className="login-box">
          <div className="login-logo">◆ NEXUS</div>
          <h2>图片实验室</h2>
          <p>请输入访问密码</p>
          <input
            type="password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value)
              setError(false)
            }}
            onKeyDown={handleKeyDown}
            placeholder="输入密码..."
            className={`login-input ${error ? 'error' : ''}`}
            autoFocus
          />
          {error && <span className="login-error">密码错误，请重试</span>}
          <button className="login-btn" onClick={handleLogin}>
            进入
          </button>
        </div>
        <Scene />
      </div>
    )
  }

  return (
    <div className="app">
      <Scene />
      
      {/* 视图切换 */}
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${view === 'gallery' ? 'active' : ''}`}
          onClick={() => setView('gallery')}
        >
          图片库
        </button>
        <button 
          className={`toggle-btn ${view === 'projects' ? 'active' : ''}`}
          onClick={() => setView('projects')}
        >
          项目卡片
        </button>
        <button
          className="toggle-btn"
          onClick={() => setIsAuthenticated(false)}
          style={{ marginLeft: 'auto' }}
        >
          退出
        </button>
      </div>
      
      {view === 'gallery' ? <UI /> : <ProjectCards />}
      <Loading />
    </div>
  )
}

export default App
