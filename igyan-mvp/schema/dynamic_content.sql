-- ============================================================
-- DYNAMIC CONTENT TABLE
-- Stores editable text for any page / section on the platform
-- ============================================================

CREATE TABLE IF NOT EXISTS dynamic_content (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page          TEXT NOT NULL,                       -- e.g. 'about', 'features'
  sub_page      TEXT DEFAULT NULL,                   -- optional sub-page grouping
  section       TEXT NOT NULL,                       -- logical section identifier
  content_key   TEXT NOT NULL,                       -- key inside the section (e.g. 'title', 'description')
  content_value TEXT NOT NULL DEFAULT '',             -- the actual text / html-safe string
  metadata1     TEXT DEFAULT NULL,                   -- extra info (icon, url, etc.)
  metadata2     TEXT DEFAULT NULL,                   -- extra info (contrast text, etc.)
  metadata3     TEXT DEFAULT NULL,                   -- extra info
  sort_order    INT DEFAULT 0,                       -- ordering within a section
  is_active     BOOLEAN DEFAULT TRUE,                -- soft toggle
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  created_by    TEXT DEFAULT NULL,
  updated_by    TEXT DEFAULT NULL
);

-- index for fast page+section lookups
CREATE INDEX IF NOT EXISTS idx_dynamic_content_page_section
  ON dynamic_content (page, section);

-- auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_dynamic_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_dynamic_content_updated_at
  BEFORE UPDATE ON dynamic_content
  FOR EACH ROW
  EXECUTE FUNCTION update_dynamic_content_timestamp();

-- enable RLS
ALTER TABLE dynamic_content ENABLE ROW LEVEL SECURITY;

-- public read
CREATE POLICY "Public read dynamic_content"
  ON dynamic_content FOR SELECT
  USING (true);

-- ============================================================
-- SEED DATA  –  ABOUT PAGE
-- ============================================================

-- Hero
INSERT INTO dynamic_content (page, section, content_key, content_value, sort_order) VALUES
('about', 'hero', 'title', 'Building the intelligent backbone for next-generation schools.', 0),
('about', 'hero', 'description', 'iGyanAI was created by a collective of educators, entrepreneurs, and technologists on a mission to craft a future where every learner can discover, design, and deploy world-changing ideas. We believe AI should be a co-pilot for community-led progress.', 1);

-- Values
INSERT INTO dynamic_content (page, section, content_key, content_value, metadata1, sort_order) VALUES
('about', 'values', 'item', 'Learner-first innovation', 'We design with students, educators, and founders to ensure every feature accelerates human potential, not just automation.', 0),
('about', 'values', 'item', 'Intelligent infrastructure', 'Our AI stack fuses campus data, skill ontologies, and LLM Sudarshan Ai copilots with rigorous safety, privacy, and compliance.', 1),
('about', 'values', 'item', 'Inclusive ecosystems', 'We partner with schools, industries, and investors to nurture equitable access to career pathways and venture capital.', 2);

-- Our Journey section
INSERT INTO dynamic_content (page, section, content_key, content_value, sort_order) VALUES
('about', 'journey', 'badge', '📖 Our Journey', 0),
('about', 'journey', 'title', 'Why I-GYAN AI exists', 1),
('about', 'journey', 'intro', 'Across the world, millions of students spend years earning degrees, yet industries continue to report a growing skills gap.', 2),
('about', 'journey', 'insight_1', 'At the same time, artificial intelligence is reshaping how value is created and how careers begin.', 3),
('about', 'journey', 'insight_2', 'The real problem is not education itself. It is the gap between learning and capability.', 4),
('about', 'journey', 'bridge_text', 'I-GYAN AI was built to bridge that gap — by enabling early skill discovery, transparent growth insights for parents, and structured access to innovation and opportunity.', 5),
('about', 'journey', 'closing', 'Because the future will not be defined by degrees alone — but by capability.', 6);

-- Problem Statements (icon in metadata1, contrast in metadata2)
INSERT INTO dynamic_content (page, section, content_key, content_value, metadata1, metadata2, sort_order) VALUES
('about', 'problem_statements', 'item', 'Education systems focus on completion.', '🎓', 'Markets demand real capability.', 0),
('about', 'problem_statements', 'item', 'Students often discover their strengths too late.', '🔍', 'Early skill discovery changes trajectories.', 1),
('about', 'problem_statements', 'item', 'Parents rely on grades to measure growth.', '📋', 'Transparent insights reveal true potential.', 2),
('about', 'problem_statements', 'item', 'Institutions struggle to align learning with opportunity.', '🏛️', 'Structured access bridges the gap.', 3);

-- Media features (url in metadata1)
INSERT INTO dynamic_content (page, section, content_key, content_value, metadata1, sort_order) VALUES
('about', 'media', 'item', 'News18 India', 'https://www.news18.com/agency-feeds/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020-9806307.html', 0),
('about', 'media', 'item', 'Business Standard', 'https://www.business-standard.com/content/press-releases-ani/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020-126010200833_1.html', 1),
('about', 'media', 'item', 'USA Report', 'https://www.usareport.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 2),
('about', 'media', 'item', 'Tribune India', 'https://www.tribuneindia.com/news/business/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 3),
('about', 'media', 'item', 'France Network Times', 'https://www.francenetworktimes.com/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 4),
('about', 'media', 'item', 'Maharashtra News Flash', 'https://maharashtranewsflash.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 5),
('about', 'media', 'item', 'UAE Times', 'https://drive.google.com/file/d/1UijFYkth6-Jx0KojlztLKymlIJvAJ9kz/view?usp=drive_link', 6),
('about', 'media', 'item', 'Travellr News India', 'https://travllernewsindia.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 7),
('about', 'media', 'item', 'Dubai City Reporter', 'https://www.dubaicityreporter.com/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 8),
('about', 'media', 'item', 'Himachal Pradesh News Flash', 'https://himachalpradeshnewsflash.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 9),
('about', 'media', 'item', 'Gujarat Watch', 'https://gujaratwatch.co.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 10),
('about', 'media', 'item', 'India News 24x7', 'https://newsindia24x7.co.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 11),
('about', 'media', 'item', 'London Channel News', 'https://www.londonchannelnews.com/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 12),
('about', 'media', 'item', 'Maharashtra Portal', 'https://maharastraportal.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 13),
('about', 'media', 'item', 'Middle East Times', 'https://www.middleeasttimes.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 14),
('about', 'media', 'item', 'Wall Street Sentinel', 'https://www.wallstreetsentinel.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 15),
('about', 'media', 'item', 'Bihar Times', 'https://www.bihartimes.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 16),
('about', 'media', 'item', 'Bihar 24x7', 'https://www.bihar24x7.com/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 17),
('about', 'media', 'item', 'Tech Times News', 'https://techtimesnews.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 18),
('about', 'media', 'item', 'Karnataka News Room', 'https://karnatakanewsroom.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 19),
('about', 'media', 'item', 'Uttarakhand News Wire', 'https://uttarakhandnewswire.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 20),
('about', 'media', 'item', 'Vancouver Herald', 'https://www.vancouverherald.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 21),
('about', 'media', 'item', 'Gujarat Samachar', 'https://www.gujaratsamachar.news/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 22),
('about', 'media', 'item', 'Jharkhand Times', 'https://www.jharkhandtimes.in/news/i-gyanai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-202020260102180826/', 23),
('about', 'media', 'item', 'Trend Stellers', 'https://trendstellers.in/i-gyan-ai-launches-ethical-teacher-centric-ai-platform-aligned-with-nep-2020/', 24),
('about', 'media', 'item', 'Washington DC', 'https://drive.google.com/file/d/1JXY_PZoPlonaHHRbxkeAEJjVZtpswKH_/view?usp=drive_link', 25),
('about', 'media', 'item', 'British News Network', 'https://drive.google.com/file/d/15HKR6bzrm1Dqn5Sci0difH_P2oyVPWBp/view?usp=drive_link', 26);

-- CTA
INSERT INTO dynamic_content (page, section, content_key, content_value, sort_order) VALUES
('about', 'cta', 'title', 'Join our coalition of builders, educators, and dreamers.', 0),
('about', 'cta', 'description', 'We are actively partnering with school networks, governments, impact investors, and ecosystem catalysts. Let''s architect AI-first education at scale.', 1),
('about', 'cta', 'primary_btn_text', 'Partner with us', 2),
('about', 'cta', 'primary_btn_link', '/contact', 3),
('about', 'cta', 'secondary_btn_text', 'Explore the platform', 4),
('about', 'cta', 'secondary_btn_link', '/features', 5);


-- ============================================================
-- SEED DATA  –  FEATURES PAGE
-- ============================================================

-- Hero
INSERT INTO dynamic_content (page, section, content_key, content_value, sort_order) VALUES
('features', 'hero', 'title', 'The AI-native platform that orchestrates your entire campus.', 0),
('features', 'hero', 'description', 'iGyanAI blends intelligent operations, personalized learning, and entrepreneurship enablement into a single experience. Every module is modular, interoperable, and governed for trust.', 1);

-- Feature Groups (group name in content_value, items as separate rows with sub_page = group title)
INSERT INTO dynamic_content (page, section, content_key, content_value, sub_page, sort_order) VALUES
('features', 'feature_groups', 'item', 'Predictive admissions forecasting and seat planning', 'Intelligent Operations', 0),
('features', 'feature_groups', 'item', 'Automated fee collection with financial aid simulations', 'Intelligent Operations', 1),
('features', 'feature_groups', 'item', 'Attendance, transport, and compliance Sudarshan Ai copilots', 'Intelligent Operations', 2),
('features', 'feature_groups', 'item', 'Adaptive curricula mapped to national and global standards', 'Learning Intelligence', 0),
('features', 'feature_groups', 'item', 'Realtime mastery dashboards for faculty and parents', 'Learning Intelligence', 1),
('features', 'feature_groups', 'item', 'AI generated lesson plans, assessments, and remediation loops', 'Learning Intelligence', 2),
('features', 'feature_groups', 'item', 'Skill passports aligned to industry micro-credentials', 'Career & Venture Lab', 0),
('features', 'feature_groups', 'item', 'Startup studio with mentorship, grants, and investor demos', 'Career & Venture Lab', 1),
('features', 'feature_groups', 'item', 'Global community exchanges and virtual internships', 'Career & Venture Lab', 2);

-- Academic Intelligence (name in content_value, detail in metadata1, icon in metadata2)
INSERT INTO dynamic_content (page, section, content_key, content_value, metadata1, metadata2, sort_order) VALUES
('features', 'academic_intelligence', 'item', 'OmniSight Live Classroom System', 'Live classes, digital whiteboard, soft board & real-time monitoring.', '📡', 0),
('features', 'academic_intelligence', 'item', 'AI Bulk Report Card Generator', 'One-click class-wide report creation with performance analytics & AI-generated remarks.', '📊', 1),
('features', 'academic_intelligence', 'item', 'Parent Engagement Module', 'Attendance alerts, report access & direct teacher communication.', '👨‍👩‍👧', 2);

INSERT INTO dynamic_content (page, section, content_key, content_value, sort_order) VALUES
('features', 'academic_intelligence', 'badge', '🧠 Academic & Learning Intelligence', 0),
('features', 'academic_intelligence', 'title', 'Supercharge teaching with intelligent classroom tools', 1),
('features', 'academic_intelligence', 'description', 'From live classes to automated report cards and parent engagement — everything educators need, powered by AI.', 2);

-- Smart Admin (name in content_value, detail in metadata1, icon in metadata2)
INSERT INTO dynamic_content (page, section, content_key, content_value, metadata1, metadata2, sort_order) VALUES
('features', 'smart_admin', 'item', 'Smart Timetable & Substitution System', 'Clash-free scheduling with auto substitute allocation & instant updates.', '📅', 0),
('features', 'smart_admin', 'item', 'Code Tutor Tools', 'AI-assisted coding practice, evaluation & skill tracking.', '💻', 1),
('features', 'smart_admin', 'item', 'IdeaSpark – 96 Govt Program Navigator', 'AI-powered idea generation with mapped access to 96+ government incubation & funding schemes.', '💡', 2);

INSERT INTO dynamic_content (page, section, content_key, content_value, sort_order) VALUES
('features', 'smart_admin', 'badge', '🏫 Smart Administration & Innovation Suite', 0),
('features', 'smart_admin', 'title', 'Streamline operations and spark innovation', 1),
('features', 'smart_admin', 'description', 'Intelligent scheduling, coding education, and government scheme navigation — all in one platform.', 2);

-- Automations (name in content_value, detail in metadata1)
INSERT INTO dynamic_content (page, section, content_key, content_value, metadata1, sort_order) VALUES
('features', 'automations', 'item', 'Pulse Streams', 'Unified data lake that feeds Sudarshan Ai copilots with contextual insights from academics, finance, and wellbeing trackers.', 0),
('features', 'automations', 'item', 'Blueprint Designer', 'Low-code workflow designer to tailor approvals, accreditation milestones, and event orchestration.', 1),
('features', 'automations', 'item', 'Impact Graphs', 'Real-time dashboards that highlight risk flags, high-performing cohorts, and ROI of new initiatives.', 2);

INSERT INTO dynamic_content (page, section, content_key, content_value, sort_order) VALUES
('features', 'automations', 'title', 'Automate mission-critical workflows', 0);

-- Governance CTA
INSERT INTO dynamic_content (page, section, content_key, content_value, sort_order) VALUES
('features', 'governance', 'title', 'Enterprise-grade AI governance', 0),
('features', 'governance', 'item_1', 'Granular role-based access controls and consent management', 1),
('features', 'governance', 'item_2', 'End-to-end encryption, audit logs, and compliance certifications', 2),
('features', 'governance', 'item_3', 'Model observability with human-in-the-loop review workflows', 3),
('features', 'governance', 'description', 'Deploy on iGyanAI cloud or within your secure infrastructure. All Sudarshan Ai copilots respect your policies and adapt to regulatory shifts.', 4);
