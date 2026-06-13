import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export interface Project {
  id: string
  name: string
  description: string
  tags: string[]
  github_url: string | null
  demo_url: string | null
  screenshot_url: string | null
  created_at: string
  updated_at: string
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const fetchProjects = async (): Promise<Project[]> => {
  if (!supabase) {
    console.warn('Supabase not configured, using demo data')
    return []
  }
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data || []
}
