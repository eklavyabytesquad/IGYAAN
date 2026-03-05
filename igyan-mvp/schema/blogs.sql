-- =============================================
-- BLOGS TABLE - Unified for I-GYAN AI Blogs & Industry Insights
-- =============================================

-- Create the blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Blog type: 'igyan_blog' or 'industry_insight'
  blog_type TEXT NOT NULL CHECK (blog_type IN ('igyan_blog', 'industry_insight')),
  
  -- Core content
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT, -- Short summary for cards
  content TEXT NOT NULL, -- Full blog content (supports markdown/HTML)
  
  -- Media
  cover_image TEXT, -- URL to cover image
  images TEXT[] DEFAULT '{}', -- Array of additional image URLs
  
  -- Resource / external links
  resource_link TEXT, -- External resource URL
  resource_label TEXT, -- Label for the resource link (e.g., "Read Full Report")
  
  -- Tags for filtering & categorization
  tags TEXT[] DEFAULT '{}', -- Array of tag strings e.g. {'AI', 'EdTech', 'NEP 2020'}
  
  -- Author info
  author_name TEXT NOT NULL DEFAULT 'I-GYAN AI Team',
  author_avatar TEXT, -- URL to author avatar
  author_role TEXT, -- e.g., 'Editor', 'Industry Analyst'
  
  -- Publishing
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  
  -- Engagement
  read_time_minutes INTEGER DEFAULT 5,
  views_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast queries by blog type
CREATE INDEX IF NOT EXISTS idx_blogs_blog_type ON blogs(blog_type);
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_featured ON blogs(is_featured, blog_type);
CREATE INDEX IF NOT EXISTS idx_blogs_tags ON blogs USING GIN(tags);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_blogs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW
  EXECUTE FUNCTION update_blogs_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Public can read published blogs
CREATE POLICY "Public can read published blogs"
  ON blogs FOR SELECT
  USING (is_published = true);

-- Authenticated users (admins) can do everything
CREATE POLICY "Admins can manage blogs"
  ON blogs FOR ALL
  USING (auth.role() = 'authenticated');

-- =============================================
-- SEED DATA - Sample Blogs
-- =============================================

INSERT INTO blogs (blog_type, title, slug, excerpt, content, cover_image, tags, author_name, author_role, is_published, is_featured, published_at, read_time_minutes, resource_link, resource_label) VALUES

-- I-GYAN AI Blogs
(
  'igyan_blog',
  'How I-GYAN AI is Revolutionizing NEP 2020 Implementation',
  'igyan-ai-revolutionizing-nep-2020',
  'Discover how I-GYAN AI''s teacher-centric platform is making NEP 2020 implementation seamless for schools across India.',
  '## The Future of Education is Here

I-GYAN AI has launched an ethical, teacher-centric AI platform that aligns perfectly with India''s National Education Policy 2020. Our platform empowers educators with AI copilots that enhance teaching without replacing the human touch.

### Key Highlights
- **Sudarshan AI Copilots** for every educator and student
- **Holistic school management** with predictive analytics
- **Career & Entrepreneurship Studio** for real-world readiness

### Why It Matters
NEP 2020 envisions a complete transformation of India''s education system. I-GYAN AI bridges the gap between policy and practice by providing schools with ready-to-deploy AI tools that respect the teacher''s role as the primary knowledge facilitator.

Our platform has already been featured in over 25+ national and international media outlets including News18, Business Standard, and Tribune India.',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
  ARRAY['NEP 2020', 'AI in Education', 'EdTech', 'Teachers'],
  'I-GYAN AI Team',
  'Editorial',
  true,
  true,
  NOW() - INTERVAL '2 days',
  7,
  NULL,
  NULL
),
(
  'igyan_blog',
  'Sudarshan AI: Your Personal Education Copilot',
  'sudarshan-ai-education-copilot',
  'Meet Sudarshan AI — the intelligent copilot designed to personalize learning for every student and streamline teaching for every educator.',
  '## Introducing Sudarshan AI

Sudarshan AI is not just another chatbot. It''s a full-spectrum educational copilot that understands curriculum, adapts to learning styles, and provides real-time insights.

### For Students
- Personalized study plans
- Interactive Q&A sessions
- Career path recommendations
- Venture pitch feedback

### For Faculty
- Automated lesson plan generation
- Formative assessment creation
- Student performance analytics
- Content differentiation tools

### For Principals
- School-wide OKR tracking
- Compliance management
- Admission forecasting
- Board-ready reports',
  'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
  ARRAY['Sudarshan AI', 'Copilot', 'Personalized Learning', 'EdTech'],
  'I-GYAN AI Team',
  'Product',
  true,
  false,
  NOW() - INTERVAL '5 days',
  6,
  NULL,
  NULL
),
(
  'igyan_blog',
  'AI Shark Simulation: Prepare Students for the Real World',
  'ai-shark-simulation-pitch-feedback',
  'Our AI Shark feature gives students real-time pitch feedback, helping them build entrepreneurial confidence from day one.',
  '## Bridging Education and Entrepreneurship

The AI Shark Simulation is I-GYAN AI''s flagship feature for the Professional Suite. It simulates a real investor pitch environment where students can:

1. **Present their ideas** to AI-powered virtual investors
2. **Receive instant feedback** on their pitch clarity, market viability, and financial projections
3. **Iterate and improve** with guided suggestions
4. **Track progress** over multiple pitch sessions

### Why Entrepreneurship in Education?
India''s startup ecosystem is booming. By integrating venture readiness into education, we ensure students graduate not just with knowledge, but with the skills to create and innovate.',
  'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
  ARRAY['AI Shark', 'Entrepreneurship', 'Pitch', 'Innovation'],
  'I-GYAN AI Team',
  'Feature Spotlight',
  true,
  true,
  NOW() - INTERVAL '1 day',
  5,
  NULL,
  NULL
),
(
  'igyan_blog',
  'Building the Future: I-GYAN AI Virtual Incubation Hub',
  'igyan-virtual-incubation-hub',
  'Explore how the Virtual Incubation Hub transforms schools into innovation centers where student startups are born.',
  '## Education Meets Innovation

The I-GYAN AI Virtual Incubation Hub is a first-of-its-kind feature that transforms educational institutions into innovation powerhouses.

### What the Hub Offers
- **Idea Validation Tools** — AI-powered market research for student projects
- **Mentor Matching** — Connect students with industry mentors
- **Resource Library** — Curated templates, pitch decks, and business plan frameworks
- **Demo Day Platform** — Showcase student ventures to the school community

### Impact
Schools using the Incubation Hub have seen a 3x increase in student-led projects and a significant boost in creative problem-solving skills.',
  'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
  ARRAY['Incubation', 'Innovation', 'Student Startups', 'EdTech'],
  'I-GYAN AI Team',
  'Product',
  true,
  false,
  NOW() - INTERVAL '8 days',
  6,
  NULL,
  NULL
),

-- Industry Insights
(
  'industry_insight',
  'The State of AI in Indian Education: 2025 Report',
  'ai-indian-education-2025-report',
  'A comprehensive analysis of how AI is being adopted across Indian schools and what the future holds for EdTech.',
  '## AI Adoption in Indian Schools — 2025

The Indian education landscape is undergoing a seismic shift. With over 1.5 million schools and 250 million students, the potential for AI-driven transformation is enormous.

### Key Findings
- **42%** of urban schools have adopted at least one AI tool
- **Teachers report 30% time savings** on administrative tasks
- **Student engagement increases by 45%** with personalized AI content
- **78%** of parents support AI-assisted learning

### Challenges
- Infrastructure gaps in rural areas
- Teacher training and digital literacy
- Data privacy and ethical AI concerns
- Cost of implementation for smaller schools

### The Road Ahead
Government initiatives like NEP 2020 and the Digital India campaign are creating fertile ground for EdTech innovation. Platforms like I-GYAN AI are leading the charge by keeping teachers at the center of the AI revolution.',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
  ARRAY['AI', 'Indian Education', 'Report', 'EdTech Trends'],
  'Industry Research Team',
  'Research Analyst',
  true,
  true,
  NOW() - INTERVAL '3 days',
  10,
  'https://www.education.gov.in/nep',
  'Read NEP 2020 Full Document'
),
(
  'industry_insight',
  'Why Teacher-Centric AI Will Win the EdTech Race',
  'teacher-centric-ai-edtech',
  'Explore why AI platforms that empower teachers rather than replace them are poised to dominate the education technology market.',
  '## The Teacher-First Approach

In the rush to deploy AI in classrooms, many EdTech companies have made a critical mistake: they''ve tried to replace teachers. The data shows this approach fails.

### Evidence from Global Studies
- Schools using teacher-augmentation AI saw **2.5x better outcomes** than those using teacher-replacement tools
- **91% of parents** prefer AI that supports teachers over standalone AI tutors
- Teacher satisfaction scores are **60% higher** in augmentation models

### What Teacher-Centric AI Looks Like
1. AI handles grading and administrative work
2. Teachers focus on mentoring, inspiration, and complex problem-solving
3. AI provides data-driven insights that teachers use to personalize attention
4. Human connection remains at the heart of education

### The Market Opportunity
The global EdTech market is projected to reach $400B by 2027. Teacher-centric platforms are the fastest-growing segment.',
  'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800',
  ARRAY['Teacher AI', 'EdTech Market', 'Industry Analysis', 'AI Ethics'],
  'Industry Research Team',
  'Market Analyst',
  true,
  true,
  NOW() - INTERVAL '6 days',
  8,
  NULL,
  NULL
),
(
  'industry_insight',
  'Global EdTech Funding Trends: What Investors Are Betting On',
  'global-edtech-funding-trends',
  'A deep dive into global EdTech funding patterns and what they reveal about the future of education technology.',
  '## Following the Money in EdTech

Global EdTech funding has evolved significantly. Here''s what the data tells us about where the smart money is going.

### 2025 Funding Highlights
- **$23.4B** total global EdTech funding
- **AI-powered platforms** received 45% of all funding
- **India** is the second-largest EdTech market by deal count
- **K-12 solutions** saw the highest growth at 67% YoY

### Top Investment Categories
1. AI Copilots for Education
2. Skills Assessment & Credentialing
3. School Management Systems
4. Virtual Labs & Simulations
5. Career Readiness Platforms

### What Investors Look For
- Strong teacher adoption metrics
- Measurable learning outcomes
- Scalable technology architecture
- Ethical AI frameworks
- Regulatory compliance (like NEP 2020 alignment)',
  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
  ARRAY['Funding', 'Investment', 'EdTech Market', 'Startups'],
  'Industry Research Team',
  'Financial Analyst',
  true,
  false,
  NOW() - INTERVAL '10 days',
  9,
  NULL,
  NULL
),
(
  'industry_insight',
  'NEP 2020 and Technology: Bridging Policy and Practice',
  'nep-2020-technology-bridging-gap',
  'Understanding how technology platforms are translating NEP 2020 vision into classroom reality.',
  '## From Policy to Practice

India''s National Education Policy 2020 is one of the most comprehensive education reform documents in the world. But implementation remains the biggest challenge.

### Technology as the Bridge
- **Competency-Based Learning**: AI platforms can track and assess competencies beyond traditional exams
- **Multilingual Education**: NLP-powered tools can deliver content in regional languages
- **Vocational Integration**: AI mentors can guide students through vocational skill pathways
- **Assessment Reform**: Continuous, formative assessment powered by AI analytics

### Success Stories
Several schools across India have successfully implemented NEP 2020 guidelines using technology:
- 85% improvement in holistic assessment adoption
- 60% reduction in administrative burden on teachers
- 3x increase in project-based learning activities

### The I-GYAN AI Approach
Platforms like I-GYAN AI have been built ground-up with NEP 2020 alignment, ensuring that schools don''t need to retrofit technology onto policy requirements.',
  'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=800',
  ARRAY['NEP 2020', 'Education Policy', 'Implementation', 'India'],
  'Industry Research Team',
  'Policy Analyst',
  true,
  false,
  NOW() - INTERVAL '12 days',
  8,
  'https://www.education.gov.in/nep',
  'Read NEP 2020 Document'
);
