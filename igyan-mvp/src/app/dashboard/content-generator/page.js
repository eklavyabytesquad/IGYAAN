'use client';

import { useState } from 'react';
import { Loader2, Download, Sparkles, FileText, Presentation, Maximize2, Minimize2, Edit3, Check, X } from 'lucide-react';
import OpenAI from 'openai';
import Image from 'next/image';
import TemplateSelector from './components/TemplateSelector';
import PreviewModal from './components/PreviewModal';
import { pptTemplates, pdfTemplates, sharkPptTemplates } from './data/templates';
import { generatePPT } from './utils/pptGenerator';
import { generatePDF } from './utils/pdfGenerator';
import { generateSharkPPT, PITCH_SLIDES } from './utils/sharkPptGenerator';

export default function ContentGenerator() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('ppt'); // 'ppt', 'pdf', or 'shark-ppt'
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [selectedPPTTemplate, setSelectedPPTTemplate] = useState(pptTemplates[0]);
  const [selectedPDFTemplate, setSelectedPDFTemplate] = useState(pdfTemplates[0]);
  const [selectedSharkTemplate, setSelectedSharkTemplate] = useState(sharkPptTemplates[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingSlideIndex, setEditingSlideIndex] = useState(null);
  const [editedSlides, setEditedSlides] = useState(null);

  const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true,
  });

  // Shark PPT specific prompt for investor pitch decks (Indian context)
  const getSharkPitchPrompt = (companyTopic) => ({
    system: `You are a distinguished startup pitch strategist with extensive experience advising ventures across India's dynamic entrepreneurial ecosystem. Craft a compelling, investor-ready 5-slide pitch deck that resonates with discerning investors.

CRITICAL GUIDELINES:
- Use Indian Rupees (₹) for ALL monetary values (e.g., ₹50 Cr, ₹2 Lakh, ₹10,000 Cr)
- Reference Indian market context, demographics, and opportunities
- Employ sophisticated, professional vocabulary - avoid commonplace expressions
- Use precise, impactful language that demonstrates domain expertise
- Include relevant Indian industry benchmarks and statistics

The pitch deck MUST adhere to this precise structure:

1. COMPANY INTRODUCTION (1-2 minutes): Articulate your value proposition
2. PROBLEM & SOLUTION (1 minute): Illuminate the market gap and your innovative resolution
3. BUSINESS MODEL (1 minute): Elucidate your revenue architecture
4. MARKET OPPORTUNITY (1 minute): Quantify the addressable market landscape
5. THE ASK (30 seconds): Present your capital requirements and deployment strategy

For each slide, deliver:
- A compelling, memorable headline
- 3-4 succinct bullet points (maximum 12 words each) using sophisticated vocabulary
- Quantifiable metrics with Indian currency (₹ in Crores/Lakhs)

VOCABULARY GUIDANCE - Use terms like:
- "Paradigm shift" instead of "change"
- "Unprecedented" instead of "new"
- "Catalyse" instead of "help"
- "Burgeoning" instead of "growing"
- "Democratise" instead of "make available"
- "Synergistic" instead of "working together"
- "Robust" instead of "strong"
- "Scalable architecture" instead of "can grow"
- "Strategic imperative" instead of "important"

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Venture Name - Compelling Tagline",
  "slides": [
    {
      "id": 1,
      "title": "Company Introduction",
      "timing": "1-2 minutes",
      "subtitle": "Pioneering [Industry] Innovation",
      "content": "- Sophisticated bullet point 1\\n- Impactful bullet point 2\\n- Compelling bullet point 3",
      "tagline": "Memorable, evocative one-liner",
      "metrics": [{"value": "1L+", "label": "Active Users"}]
    },
    {
      "id": 2,
      "title": "Problem & Solution",
      "timing": "1 minute",
      "subtitle": "Addressing Critical Market Gaps",
      "content": "- Articulate problem statement\\n- Innovative solution approach\\n- Distinctive competitive moat"
    },
    {
      "id": 3,
      "title": "Business Model",
      "timing": "1 minute",
      "subtitle": "Revenue Architecture",
      "content": "- Primary revenue stream\\n- Secondary monetisation avenue\\n- Strategic pricing framework",
      "metrics": [{"value": "₹500", "label": "ARPU"}]
    },
    {
      "id": 4,
      "title": "Market Opportunity",
      "timing": "1 minute",
      "subtitle": "Addressable Market Landscape",
      "content": "- Total Addressable Market (TAM)\\n- Target demographic profile\\n- Sustainable competitive advantage",
      "metrics": [{"value": "₹10,000 Cr", "label": "TAM"}, {"value": "₹500 Cr", "label": "SAM"}]
    },
    {
      "id": 5,
      "title": "The Ask",
      "timing": "30 seconds",
      "subtitle": "Capital Requirements",
      "content": "- Funding quantum sought\\n- Strategic fund deployment\\n- Projected milestones",
      "metrics": [{"value": "₹5 Cr", "label": "Seeking"}, {"value": "18 months", "label": "Runway"}]
    }
  ]
}`,
    user: `Craft a distinguished investor pitch deck for: "${companyTopic}". 

REQUIREMENTS:
- Make it compelling, sophisticated, and investor-ready for the Indian market
- Use Indian Rupees (₹) with Crores/Lakhs notation for all monetary figures
- Employ professional, elevated vocabulary throughout
- Include realistic, contextually relevant metrics for the Indian ecosystem
- Reference Indian market dynamics, consumer behaviour, and growth trajectories

Return as JSON with the exact structure specified. Ensure every bullet point demonstrates thought leadership and domain expertise.`
  });

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      let messages;
      
      // Use different prompts based on content type
      if (contentType === 'shark-ppt') {
        const sharkPrompt = getSharkPitchPrompt(topic);
        messages = [
          { role: 'system', content: sharkPrompt.system },
          { role: 'user', content: sharkPrompt.user }
        ];
      } else {
        messages = [
          {
            role: 'system',
            content: `You are a professional content creator for igyan education platform. 

Create comprehensive, well-structured educational content with:
- Clear introduction explaining the topic
- 5-7 detailed sections with descriptive titles
- Each section should have 3-5 bullet points with substantive information
- Include examples, key concepts, and practical insights
- Use professional educational language
- Make content engaging and informative

FORMAT YOUR RESPONSE AS JSON:
{
  "title": "Clean Professional Title (Max 60 chars)",
  "content": "Full formatted content with sections separated by double line breaks. Use section titles followed by colons."
}`,
          },
          {
            role: 'user',
            content: `Create comprehensive educational content about: "${topic}". Return as JSON with "title" and "content" fields.`,
          },
        ];
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.7,
        max_tokens: contentType === 'shark-ppt' ? 3000 : 2000,
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(response.choices[0].message.content);
      
      if (contentType === 'shark-ppt') {
        const slides = aiResponse.slides || [];
        setGeneratedContent({
          type: contentType,
          content: JSON.stringify(aiResponse),
          title: aiResponse.title || topic,
          slides: slides
        });
        setEditedSlides(slides);
      } else {
        setGeneratedContent({
          type: contentType,
          content: aiResponse.content,
          title: aiResponse.title || topic
        });
      }
      
      setShowPreview(false);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedContent) return;

    setIsDownloading(true);
    try {
      let template;
      
      if (generatedContent.type === 'ppt') {
        template = selectedPPTTemplate;
        await generatePPT(generatedContent.content, generatedContent.title, template);
      } else if (generatedContent.type === 'pdf') {
        template = selectedPDFTemplate;
        await generatePDF(generatedContent.content, generatedContent.title, template);
      } else if (generatedContent.type === 'shark-ppt') {
        template = selectedSharkTemplate;
        // Use edited slides if available
        const slidesContent = editedSlides ? JSON.stringify({ title: generatedContent.title, slides: editedSlides }) : generatedContent.content;
        await generateSharkPPT(slidesContent, generatedContent.title, template);
      }
    } catch (error) {
      console.error('Error downloading:', error);
      alert('Failed to download. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleReset = () => {
    setTopic('');
    setGeneratedContent(null);
    setShowPreview(false);
    setContentType('ppt');
    setEditedSlides(null);
    setEditingSlideIndex(null);
    setIsFullscreen(false);
  };

  // Handle slide content editing
  const handleSlideEdit = (slideIndex, field, value) => {
    const updatedSlides = [...editedSlides];
    updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], [field]: value };
    setEditedSlides(updatedSlides);
  };

  // Handle metric editing
  const handleMetricEdit = (slideIndex, metricIndex, field, value) => {
    const updatedSlides = [...editedSlides];
    const metrics = [...(updatedSlides[slideIndex].metrics || [])];
    metrics[metricIndex] = { ...metrics[metricIndex], [field]: value };
    updatedSlides[slideIndex] = { ...updatedSlides[slideIndex], metrics };
    setEditedSlides(updatedSlides);
  };

  // Get current slides (edited or original)
  const currentSlides = editedSlides || generatedContent?.slides || [];

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 lg:p-8" style={{ backgroundColor: 'var(--dashboard-background)' }}>
      {/* Header */}
      <header className="dashboard-card rounded-3xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl p-4 text-white shadow-lg" style={{ background: contentType === 'shark-ppt' ? 'linear-gradient(135deg, #1E3A5F 0%, #FF6B35 100%)' : 'var(--dashboard-primary)' }}>
            {contentType === 'shark-ppt' ? <Image src="/asset/ai-shark/suitshark.png" alt="Shark" width={40} height={40} /> : <Sparkles size={28} />}
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: 'var(--dashboard-heading)' }}>
              {contentType === 'shark-ppt' ? '🦈 Shark PPT Generator' : 'Content Studio'}
            </h1>
            <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: 'var(--dashboard-muted)' }}>
              {contentType === 'shark-ppt' 
                ? 'Create investor-ready pitch decks in seconds. Just enter your startup idea and get a professional 5-slide presentation!'
                : 'Generate lesson-ready presentations and polished PDFs instantly. Just enter your topic, choose format, and download!'
              }
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {!generatedContent ? (
        /* Input Form */
        <section className="dashboard-card rounded-3xl p-8 shadow-2xl">
          <div className="mx-auto max-w-3xl space-y-8">
            {/* Topic Input */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                {contentType === 'shark-ppt' ? 'Enter Your Startup/Company Idea' : 'Enter Your Topic'}
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={contentType === 'shark-ppt' 
                  ? 'e.g., AI-powered tutoring platform, Eco-friendly food delivery, Health tech startup...'
                  : 'e.g., AI in Education, Quantum Physics, Climate Change...'
                }
                className="w-full rounded-xl px-6 py-4 text-base shadow-sm outline-none transition"
                style={{
                  borderColor: 'var(--dashboard-border)',
                  borderWidth: '1px',
                  backgroundColor: 'var(--dashboard-surface-solid)',
                  color: 'var(--dashboard-text)'
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isGenerating) {
                    handleGenerate();
                  }
                }}
              />
            </div>

            {/* Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                Choose Format
              </label>
              <div className="grid gap-4 sm:grid-cols-3">
                <button
                  onClick={() => setContentType('ppt')}
                  className="flex items-center gap-4 rounded-xl p-6 transition"
                  style={{
                    borderColor: contentType === 'ppt' ? 'var(--dashboard-primary)' : 'var(--dashboard-border)',
                    borderWidth: '2px',
                    backgroundColor: contentType === 'ppt' ? 'var(--dashboard-surface-muted)' : 'var(--dashboard-surface-solid)',
                  }}
                >
                  <div className="rounded-xl p-3 text-white" style={{ background: 'var(--dashboard-primary)' }}>
                    <Presentation size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                      PowerPoint
                    </div>
                    <div className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                      Presentation slides
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setContentType('pdf')}
                  className="flex items-center gap-4 rounded-xl p-6 transition"
                  style={{
                    borderColor: contentType === 'pdf' ? 'var(--dashboard-primary)' : 'var(--dashboard-border)',
                    borderWidth: '2px',
                    backgroundColor: contentType === 'pdf' ? 'var(--dashboard-surface-muted)' : 'var(--dashboard-surface-solid)',
                  }}
                >
                  <div className="rounded-xl p-3 text-white" style={{ background: 'var(--dashboard-primary)' }}>
                    <FileText size={24} />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                      PDF Document
                    </div>
                    <div className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                      Text document
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setContentType('shark-ppt')}
                  className="flex items-center gap-4 rounded-xl p-6 transition relative overflow-hidden"
                  style={{
                    borderColor: contentType === 'shark-ppt' ? '#FF6B35' : 'var(--dashboard-border)',
                    borderWidth: '2px',
                    backgroundColor: contentType === 'shark-ppt' ? 'rgba(255, 107, 53, 0.1)' : 'var(--dashboard-surface-solid)',
                  }}
                >
                  <div className="rounded-xl p-2 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #FF6B35 100%)' }}>
                    <Image src="/asset/ai-shark/suitshark.png" alt="Shark" width={48} height={48} className="object-contain" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-2" style={{ color: 'var(--dashboard-heading)' }}>
                      Shark PPT
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold">
                        NEW
                      </span>
                    </div>
                    <div className="text-xs" style={{ color: 'var(--dashboard-muted)' }}>
                      Investor pitch deck
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                Choose Template Style
              </label>
              <TemplateSelector
                templates={contentType === 'ppt' ? pptTemplates : contentType === 'pdf' ? pdfTemplates : sharkPptTemplates}
                selectedTemplate={contentType === 'ppt' ? selectedPPTTemplate : contentType === 'pdf' ? selectedPDFTemplate : selectedSharkTemplate}
                onSelect={contentType === 'ppt' ? setSelectedPPTTemplate : contentType === 'pdf' ? setSelectedPDFTemplate : setSelectedSharkTemplate}
                type={contentType}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="w-full rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: contentType === 'shark-ppt' ? 'linear-gradient(135deg, #1E3A5F 0%, #FF6B35 100%)' : 'var(--dashboard-primary)' }}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin" size={20} />
                  {contentType === 'shark-ppt' ? 'Creating Pitch Deck...' : 'Generating Content...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  {contentType === 'shark-ppt' ? <Image src="/asset/ai-shark/suitshark.png" alt="Shark" width={28} height={28} /> : <Sparkles size={20} />}
                  Generate {contentType === 'ppt' ? 'Presentation' : contentType === 'pdf' ? 'PDF' : 'Pitch Deck'}
                </span>
              )}
            </button>
          </div>
        </section>
      ) : (
        /* Preview Section */
        <section className={`dashboard-card rounded-3xl shadow-2xl overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}>
          {/* Header with Actions */}
          <div className="border-b p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4" style={{ borderColor: 'var(--dashboard-border)', backgroundColor: generatedContent.type === 'shark-ppt' ? 'linear-gradient(135deg, #1E3A5F 0%, #FF6B35 100%)' : 'var(--dashboard-surface-solid)' }}>
            <div className="flex items-center gap-4">
              {generatedContent.type === 'shark-ppt' && (
                <Image 
                  src="/asset/ai-shark/sharkicon.png" 
                  alt="Shark AI" 
                  width={48} 
                  height={48} 
                  className="rounded-xl"
                />
              )}
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold ${generatedContent.type === 'shark-ppt' ? 'text-white' : ''}`} style={{ color: generatedContent.type === 'shark-ppt' ? '#FFFFFF' : 'var(--dashboard-heading)' }}>
                  {generatedContent.title}
                </h2>
                <p className={`text-sm mt-1 ${generatedContent.type === 'shark-ppt' ? 'text-white/70' : ''}`} style={{ color: generatedContent.type === 'shark-ppt' ? 'rgba(255,255,255,0.7)' : 'var(--dashboard-muted)' }}>
                  {generatedContent.type === 'ppt' ? 'PowerPoint Presentation' : generatedContent.type === 'pdf' ? 'PDF Document' : 'Investor Pitch Deck'} • {generatedContent.type === 'ppt' ? selectedPPTTemplate.name : generatedContent.type === 'pdf' ? selectedPDFTemplate.name : selectedSharkTemplate.name} Template
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {generatedContent.type === 'shark-ppt' && (
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold transition flex items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: '#FFFFFF'
                  }}
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                  <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
                </button>
              )}
              <button
                onClick={handleReset}
                className="rounded-xl px-3 sm:px-4 py-2 text-sm font-semibold transition"
                style={{
                  borderColor: generatedContent.type === 'shark-ppt' ? 'rgba(255,255,255,0.3)' : 'var(--dashboard-border)',
                  borderWidth: '1px',
                  backgroundColor: generatedContent.type === 'shark-ppt' ? 'rgba(255,255,255,0.1)' : 'var(--dashboard-surface-solid)',
                  color: generatedContent.type === 'shark-ppt' ? '#FFFFFF' : 'var(--dashboard-text)'
                }}
              >
                🔄 <span className="hidden sm:inline">New</span>
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="rounded-xl px-4 sm:px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: generatedContent.type === 'shark-ppt' ? '#FFFFFF' : 'var(--dashboard-primary)', color: generatedContent.type === 'shark-ppt' ? '#1E3A5F' : '#FFFFFF' }}
              >
                {isDownloading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    Downloading...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Download size={16} />
                    Download
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Content Preview */}
          <div className={`p-4 sm:p-8 overflow-y-auto ${isFullscreen ? 'h-[calc(100vh-100px)]' : 'max-h-[calc(100vh-24rem)]'}`} style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
            <div className={`mx-auto rounded-xl ${isFullscreen ? 'max-w-6xl' : 'max-w-4xl'}`}>
              {generatedContent.type === 'shark-ppt' && currentSlides.length > 0 ? (
                // Shark PPT Slide Preview with Edit
                <div className={`grid gap-6 ${isFullscreen ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                  {currentSlides.map((slide, idx) => (
                    <div 
                      key={idx} 
                      className={`rounded-2xl overflow-hidden shadow-xl transition-all ${isFullscreen ? 'hover:scale-[1.02]' : ''}`}
                      style={{ 
                        backgroundColor: 'var(--dashboard-surface-solid)',
                        border: '1px solid var(--dashboard-border)'
                      }}
                    >
                      {/* Slide Header */}
                      <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #1E3A5F 0%, #3D5A80 100%)' }}>
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm">
                            {idx + 1}
                          </span>
                          {editingSlideIndex === idx ? (
                            <input
                              type="text"
                              value={slide.title}
                              onChange={(e) => handleSlideEdit(idx, 'title', e.target.value)}
                              className="bg-white/10 text-white font-bold text-lg px-2 py-1 rounded border border-white/30 outline-none focus:border-white"
                              style={{ minWidth: '200px' }}
                            />
                          ) : (
                            <h3 className="text-lg font-bold text-white">{slide.title}</h3>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-white/20 text-white font-medium">
                            ⏱ {slide.timing}
                          </span>
                          <button
                            onClick={() => setEditingSlideIndex(editingSlideIndex === idx ? null : idx)}
                            className="p-2 rounded-lg hover:bg-white/20 transition text-white"
                          >
                            {editingSlideIndex === idx ? <Check size={16} /> : <Edit3 size={16} />}
                          </button>
                        </div>
                      </div>
                      
                      {/* Slide Content */}
                      <div className="p-6">
                        {/* Subtitle */}
                        {editingSlideIndex === idx ? (
                          <input
                            type="text"
                            value={slide.subtitle || ''}
                            onChange={(e) => handleSlideEdit(idx, 'subtitle', e.target.value)}
                            placeholder="Subtitle..."
                            className="w-full text-sm italic mb-4 px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-orange-500/30"
                            style={{ 
                              backgroundColor: 'var(--dashboard-surface-muted)',
                              borderColor: 'var(--dashboard-border)',
                              color: 'var(--dashboard-muted)'
                            }}
                          />
                        ) : (
                          <p className="text-sm mb-4 italic" style={{ color: 'var(--dashboard-muted)' }}>
                            {slide.subtitle}
                          </p>
                        )}
                        
                        {/* Content bullets */}
                        {editingSlideIndex === idx ? (
                          <textarea
                            value={slide.content || ''}
                            onChange={(e) => handleSlideEdit(idx, 'content', e.target.value)}
                            placeholder="- Bullet point 1&#10;- Bullet point 2&#10;- Bullet point 3"
                            rows={5}
                            className="w-full px-3 py-2 rounded-lg border outline-none focus:ring-2 focus:ring-orange-500/30 text-sm"
                            style={{ 
                              backgroundColor: 'var(--dashboard-surface-muted)',
                              borderColor: 'var(--dashboard-border)',
                              color: 'var(--dashboard-text)'
                            }}
                          />
                        ) : (
                          <div className="space-y-2" style={{ color: 'var(--dashboard-text)' }}>
                            {slide.content?.split('\n').filter(l => l.trim()).map((line, i) => (
                              <div key={i} className="flex gap-3 items-start">
                                <span className="text-orange-500 mt-0.5 text-lg">•</span>
                                <span className="text-sm leading-relaxed">{line.replace(/^[-•]\s*/, '')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Metrics */}
                        {slide.metrics && slide.metrics.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t" style={{ borderColor: 'var(--dashboard-border)' }}>
                            {slide.metrics.map((metric, mIdx) => (
                              <div key={mIdx} className="flex-1 min-w-[100px] text-center px-4 py-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #FF6B35 0%, #FF8B5F 100%)' }}>
                                {editingSlideIndex === idx ? (
                                  <>
                                    <input
                                      type="text"
                                      value={metric.value}
                                      onChange={(e) => handleMetricEdit(idx, mIdx, 'value', e.target.value)}
                                      className="w-full text-center text-lg font-bold bg-white/20 text-white rounded px-2 py-1 outline-none mb-1"
                                    />
                                    <input
                                      type="text"
                                      value={metric.label}
                                      onChange={(e) => handleMetricEdit(idx, mIdx, 'label', e.target.value)}
                                      className="w-full text-center text-xs bg-white/20 text-white/80 rounded px-2 py-1 outline-none"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <div className="text-xl font-bold text-white">{metric.value}</div>
                                    <div className="text-xs text-white/80">{metric.label}</div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Original PPT/PDF Preview
                generatedContent.content.split('\n\n').map((section, idx) => {
                  const lines = section.split('\n');
                  const title = lines[0];
                  const content = lines.slice(1).join('\n');

                  if (title.includes(':')) {
                    // Section with title
                    return (
                      <div key={idx} className="mb-6">
                        <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--dashboard-heading)' }}>
                          {title.replace(':', '')}
                        </h3>
                        <div className="space-y-2" style={{ color: 'var(--dashboard-text)' }}>
                          {content.split('\n').map((line, i) => (
                            <div key={i} className="ml-4">
                              {line.trim().startsWith('-') || line.trim().startsWith('•') ? (
                                <div className="flex gap-2">
                                  <span>•</span>
                                  <span>{line.replace(/^[-•]\s*/, '')}</span>
                                </div>
                              ) : (
                                <p>{line}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  } else {
                    // Regular paragraph
                    return (
                      <p key={idx} className="mb-4 leading-relaxed" style={{ color: 'var(--dashboard-text)' }}>
                        {section}
                      </p>
                    );
                  }
                })
              )}
            </div>
          </div>
        </section>
      )}

      {/* Preview Modal */}
      {showPreview && generatedContent && (
        <PreviewModal
          content={generatedContent.content}
          title={generatedContent.title}
          type={generatedContent.type}
          onClose={() => setShowPreview(false)}
          onDownload={handleDownload}
        />
      )}
    </div>
  );
}
