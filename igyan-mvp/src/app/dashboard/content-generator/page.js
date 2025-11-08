'use client';

import { useState } from 'react';
import { Loader2, Download, Sparkles, FileText, Presentation } from 'lucide-react';
import OpenAI from 'openai';
import TemplateSelector from './components/TemplateSelector';
import PreviewModal from './components/PreviewModal';
import { pptTemplates, pdfTemplates } from './data/templates';
import { generatePPT } from './utils/pptGenerator';
import { generatePDF } from './utils/pdfGenerator';

export default function ContentGenerator() {
  const [topic, setTopic] = useState('');
  const [contentType, setContentType] = useState('ppt'); // 'ppt' or 'pdf'
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [selectedPPTTemplate, setSelectedPPTTemplate] = useState(pptTemplates[0]);
  const [selectedPDFTemplate, setSelectedPDFTemplate] = useState(pdfTemplates[0]);
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  
  const openai = new OpenAI({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const handleGenerate = async () => {
    if (!topic.trim()) return;

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
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
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: { type: "json_object" }
      });

      const aiResponse = JSON.parse(response.choices[0].message.content);
      
      setGeneratedContent({
        type: contentType,
        content: aiResponse.content,
        title: aiResponse.title || topic
      });
      
      setShowPreview(true);
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
      const template = generatedContent.type === 'ppt' ? selectedPPTTemplate : selectedPDFTemplate;
      
      if (generatedContent.type === 'ppt') {
        await generatePPT(generatedContent.content, generatedContent.title, template);
      } else {
        await generatePDF(generatedContent.content, generatedContent.title, template);
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
  };

  return (
    <div className="flex w-full flex-1 flex-col gap-6 p-4 lg:p-8" style={{ backgroundColor: 'var(--dashboard-background)' }}>
      {/* Header */}
      <header className="dashboard-card rounded-3xl p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl p-4 text-white shadow-lg" style={{ background: 'var(--dashboard-primary)' }}>
            <Sparkles size={28} />
          </span>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl" style={{ color: 'var(--dashboard-heading)' }}>
              Content Studio
            </h1>
            <p className="mt-2 max-w-xl text-sm sm:text-base" style={{ color: 'var(--dashboard-muted)' }}>
              Generate lesson-ready presentations and polished PDFs instantly. Just enter your topic, choose format, and download!
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
                Enter Your Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., AI in Education, Quantum Physics, Climate Change..."
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
              <div className="grid gap-4 sm:grid-cols-2">
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
              </div>
            </div>

            {/* Template Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold" style={{ color: 'var(--dashboard-heading)' }}>
                Choose Template Style
              </label>
              <TemplateSelector
                templates={contentType === 'ppt' ? pptTemplates : pdfTemplates}
                selectedTemplate={contentType === 'ppt' ? selectedPPTTemplate : selectedPDFTemplate}
                onSelect={contentType === 'ppt' ? setSelectedPPTTemplate : setSelectedPDFTemplate}
                type={contentType}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={!topic.trim() || isGenerating}
              className="w-full rounded-xl px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ background: 'var(--dashboard-primary)' }}
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-3">
                  <Loader2 className="animate-spin" size={20} />
                  Generating Content...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <Sparkles size={20} />
                  Generate {contentType === 'ppt' ? 'Presentation' : 'PDF'}
                </span>
              )}
            </button>
          </div>
        </section>
      ) : (
        /* Preview Section */
        <section className="dashboard-card rounded-3xl shadow-2xl overflow-hidden">
          {/* Header with Actions */}
          <div className="border-b p-6 flex items-center justify-between" style={{ borderColor: 'var(--dashboard-border)' }}>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--dashboard-heading)' }}>
                {generatedContent.title}
              </h2>
              <p className="text-sm mt-1" style={{ color: 'var(--dashboard-muted)' }}>
                {generatedContent.type === 'ppt' ? 'PowerPoint Presentation' : 'PDF Document'} • {generatedContent.type === 'ppt' ? selectedPPTTemplate.name : selectedPDFTemplate.name} Template
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleReset}
                className="rounded-xl px-4 py-2 text-sm font-semibold transition"
                style={{
                  borderColor: 'var(--dashboard-border)',
                  borderWidth: '1px',
                  backgroundColor: 'var(--dashboard-surface-solid)',
                  color: 'var(--dashboard-text)'
                }}
              >
                🔄 New Content
              </button>
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="rounded-xl px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{ background: 'var(--dashboard-primary)' }}
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
          <div className="p-8 max-h-[calc(100vh-24rem)] overflow-y-auto">
            <div className="mx-auto max-w-4xl rounded-xl p-8" style={{ backgroundColor: 'var(--dashboard-surface-muted)' }}>
              {generatedContent.content.split('\n\n').map((section, idx) => {
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
              })}
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
