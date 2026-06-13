-- 项目卡片数据库表设计
-- 请在Supabase SQL编辑器中执行此脚本

-- 1. 创建项目表
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL COMMENT '项目名称',
  description TEXT NOT NULL DEFAULT '' COMMENT '项目描述',
  tags TEXT[] NOT NULL DEFAULT '{}' COMMENT '技术标签数组',
  github_url TEXT,
  demo_url TEXT,
  screenshot_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用RLS (行级安全策略)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 3. 创建公开读取策略（任何人可以查看项目）
CREATE POLICY "允许公开读取项目"
  ON projects FOR SELECT
  USING (true);

-- 4. 创建插入策略（仅认证用户可以插入）
CREATE POLICY "仅认证用户可插入项目"
  ON projects FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- 5. 创建更新策略（仅认证用户可以更新）
CREATE POLICY "仅认证用户可更新项目"
  ON projects FOR UPDATE
  USING (auth.role() = 'authenticated');

-- 6. 创建删除策略（仅认证用户可以删除）
CREATE POLICY "仅认证用户可删除项目"
  ON projects FOR DELETE
  USING (auth.role() = 'authenticated');

-- 7. 创建自动更新updated_at的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. 插入示例项目数据（硬编码项目信息）
INSERT INTO projects (name, description, tags, github_url, demo_url, screenshot_url) VALUES
(
  'Nexus Image Lab',
  '现代化图片库管理应用，支持多种视图模式，包括网格球体、轮播、瀑布流和时间轴视图。',
  ARRAY['React', 'TypeScript', 'Vite', 'Zustand', 'Framer Motion'],
  'https://github.com/example/nexus-image-lab',
  'https://nexus-image-lab.demo.com',
  NULL  -- 使用ASCII占位图
),
(
  'AI Dashboard',
  '基于人工智能的数据分析仪表盘，实时可视化处理结果。',
  ARRAY['React', 'D3.js', 'TensorFlow.js', 'Node.js'],
  'https://github.com/example/ai-dashboard',
  'https://ai-dashboard.demo.com',
  NULL  -- 使用ASCII占位图
),
(
  'E-Commerce Plus',
  '完整的电商解决方案，包含产品管理、购物车、订单系统和支付集成。',
  ARRAY['Next.js', 'Prisma', 'PostgreSQL', 'Stripe'],
  'https://github.com/example/ecommerce-plus',
  'https://ecommerce-plus.demo.com',
  NULL  -- 使用ASCII占位图
);
