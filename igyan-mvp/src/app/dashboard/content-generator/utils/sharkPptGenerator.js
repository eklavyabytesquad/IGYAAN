'use client';

import PptxGenJS from 'pptxgenjs';

// Fixed 5-slide structure for investor pitch decks
const PITCH_SLIDES = [
  {
    id: 1,
    title: 'Company Introduction',
    timing: '1-2 minutes',
    description: 'Who you are & what you do',
  },
  {
    id: 2,
    title: 'Problem & Solution',
    timing: '1 minute',
    description: 'The pain point & your fix',
  },
  {
    id: 3,
    title: 'Business Model',
    timing: '1 minute',
    description: 'How you make money',
  },
  {
    id: 4,
    title: 'Market Opportunity',
    timing: '1 minute',
    description: 'Market size & competition',
  },
  {
    id: 5,
    title: 'The Ask',
    timing: '30 seconds',
    description: 'Funding & terms',
  },
];

export const generateSharkPPT = async (content, title, template) => {
  try {
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'Shark AI - IGYAN';
    pptx.title = title || 'Investor Pitch Deck';
    pptx.subject = 'Created by Shark PPT Generator';
    pptx.company = 'IGYAN';
    
    // Set default slide size (16:9 widescreen)
    pptx.defineLayout({ name: 'WIDESCREEN', width: 10, height: 5.625 });
    pptx.layout = 'WIDESCREEN';

    // Parse the structured content
    let slides;
    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      slides = parsed.slides || [];
    } catch {
      // Fallback if content is plain text
      slides = PITCH_SLIDES.map((slide, idx) => ({
        ...slide,
        content: content.split('\n\n')[idx] || '',
      }));
    }

    // ============ TITLE SLIDE ============
    let titleSlide = pptx.addSlide();
    
    // Gradient-like background using shapes
    titleSlide.background = { color: template.colors.primary };
    
    // Decorative accent shape (top right)
    titleSlide.addShape('rect', {
      x: 7,
      y: 0,
      w: 3,
      h: 1.5,
      fill: { color: template.colors.accent },
      rotate: -15,
    });
    
    // Decorative accent shape (bottom left)
    titleSlide.addShape('ellipse', {
      x: -0.5,
      y: 4,
      w: 2,
      h: 2,
      fill: { color: template.colors.secondary },
    });
    
    // Company/Pitch Title
    titleSlide.addText(title || 'Investor Pitch Deck', {
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 1.2,
      fontSize: template.fontSizes.title,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      fontFace: 'Arial',
    });
    
    // Tagline if available
    if (slides[0]?.tagline) {
      titleSlide.addText(slides[0].tagline, {
        x: 0.5,
        y: 3.0,
        w: 9,
        h: 0.6,
        fontSize: 20,
        color: 'FFFFFF',
        align: 'center',
        italic: true,
        fontFace: 'Arial',
      });
    }
    
    // Shark AI branding (bottom)
    titleSlide.addText('Powered by Shark AI', {
      x: 0.5,
      y: 5.0,
      w: 9,
      h: 0.4,
      fontSize: 12,
      color: 'FFFFFF',
      align: 'center',
      fontFace: 'Arial',
    });

    // ============ CONTENT SLIDES ============
    slides.forEach((slideData, index) => {
      const pitchInfo = PITCH_SLIDES[index] || {};
      const slide = pptx.addSlide();
      slide.background = { color: template.colors.background };
      
      // Left accent bar
      slide.addShape('rect', {
        x: 0,
        y: 0,
        w: 0.15,
        h: 5.625,
        fill: { color: template.colors.primary },
      });
      
      // Slide number circle
      slide.addShape('ellipse', {
        x: 0.3,
        y: 0.2,
        w: 0.5,
        h: 0.5,
        fill: { color: template.colors.accent },
      });
      slide.addText(`${index + 1}`, {
        x: 0.3,
        y: 0.25,
        w: 0.5,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: 'FFFFFF',
        align: 'center',
        fontFace: 'Arial',
      });

      // Timing badge (top right)
      const timing = slideData.timing || pitchInfo.timing || '';
      if (timing) {
        slide.addShape('roundRect', {
          x: 8.0,
          y: 0.15,
          w: 1.6,
          h: 0.35,
          fill: { color: template.colors.accent },
          rectRadius: 0.1,
        });
        slide.addText(`⏱ ${timing}`, {
          x: 8.0,
          y: 0.18,
          w: 1.6,
          h: 0.35,
          fontSize: 10,
          bold: true,
          color: 'FFFFFF',
          align: 'center',
          fontFace: 'Arial',
        });
      }

      // Section Title
      const slideTitle = slideData.title || pitchInfo.title || `Slide ${index + 1}`;
      slide.addText(slideTitle, {
        x: 1.0,
        y: 0.2,
        w: 6.5,
        h: 0.6,
        fontSize: template.fontSizes.heading,
        bold: true,
        color: template.colors.primary,
        fontFace: 'Arial',
      });

      // Section subtitle/description
      const subtitle = slideData.subtitle || pitchInfo.description || '';
      if (subtitle) {
        slide.addText(subtitle, {
          x: 1.0,
          y: 0.75,
          w: 6.5,
          h: 0.35,
          fontSize: 12,
          color: template.colors.secondary,
          italic: true,
          fontFace: 'Arial',
        });
      }

      // Divider line
      slide.addShape('line', {
        x: 1.0,
        y: 1.15,
        w: 8.5,
        h: 0,
        line: { color: template.colors.accent, width: 2 },
      });

      // Main content
      const mainContent = slideData.content || '';
      if (mainContent) {
        // Check if content has bullet points
        const lines = mainContent.split('\n').filter(l => l.trim());
        const hasBullets = lines.some(l => l.trim().startsWith('-') || l.trim().startsWith('•'));

        if (hasBullets) {
          const bullets = lines.map(line => ({
            text: line.replace(/^[-•]\s*/, '').trim(),
            options: { bullet: { type: 'bullet', color: template.colors.accent }, paraSpaceBefore: 6, paraSpaceAfter: 6 }
          }));

          slide.addText(bullets, {
            x: 1.0,
            y: 1.35,
            w: 8.5,
            h: 2.8,
            fontSize: template.fontSizes.body,
            color: template.colors.text,
            valign: 'top',
            fontFace: 'Arial',
          });
        } else {
          slide.addText(mainContent, {
            x: 1.0,
            y: 1.35,
            w: 8.5,
            h: 2.8,
            fontSize: template.fontSizes.body,
            color: template.colors.text,
            valign: 'top',
            fontFace: 'Arial',
          });
        }
      }

      // Key metrics box (if available)
      if (slideData.metrics && slideData.metrics.length > 0) {
        const metricsPerRow = Math.min(slideData.metrics.length, 3);
        const metricWidth = 8.5 / metricsPerRow;
        
        slideData.metrics.forEach((metric, mIdx) => {
          const xPos = 1.0 + (mIdx % metricsPerRow) * metricWidth;
          const yPos = 4.3;
          
          // Metric card background
          slide.addShape('roundRect', {
            x: xPos,
            y: yPos,
            w: metricWidth - 0.2,
            h: 1.0,
            fill: { color: template.colors.accent },
            rectRadius: 0.1,
          });
          
          // Metric value
          slide.addText(metric.value || '', {
            x: xPos,
            y: yPos + 0.1,
            w: metricWidth - 0.2,
            h: 0.5,
            fontSize: 18,
            bold: true,
            color: 'FFFFFF',
            align: 'center',
            fontFace: 'Arial',
          });
          
          // Metric label
          slide.addText(metric.label || '', {
            x: xPos,
            y: yPos + 0.55,
            w: metricWidth - 0.2,
            h: 0.35,
            fontSize: 10,
            color: 'FFFFFF',
            align: 'center',
            fontFace: 'Arial',
          });
        });
      }

      // Footer branding
      slide.addText('Shark AI', {
        x: 8.5,
        y: 5.2,
        w: 1.2,
        h: 0.3,
        fontSize: 8,
        color: template.colors.secondary,
        align: 'right',
        fontFace: 'Arial',
      });
    });

    // ============ THANK YOU SLIDE ============
    const thankYouSlide = pptx.addSlide();
    thankYouSlide.background = { color: template.colors.primary };
    
    // Decorative shapes
    thankYouSlide.addShape('ellipse', {
      x: -1,
      y: -1,
      w: 3,
      h: 3,
      fill: { color: template.colors.secondary },
    });
    
    thankYouSlide.addShape('ellipse', {
      x: 8.5,
      y: 4,
      w: 2.5,
      h: 2.5,
      fill: { color: template.colors.accent },
    });
    
    thankYouSlide.addText('Thank You!', {
      x: 0.5,
      y: 1.8,
      w: 9,
      h: 0.8,
      fontSize: 44,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      fontFace: 'Arial',
    });
    
    thankYouSlide.addText("Let's Build Something Extraordinary Together", {
      x: 0.5,
      y: 2.7,
      w: 9,
      h: 0.5,
      fontSize: 18,
      color: 'FFFFFF',
      align: 'center',
      fontFace: 'Arial',
    });

    if (slides[0]?.contact) {
      thankYouSlide.addText(slides[0].contact, {
        x: 0.5,
        y: 3.8,
        w: 9,
        h: 0.4,
        fontSize: 14,
        color: 'FFFFFF',
        align: 'center',
        fontFace: 'Arial',
      });
    }

    thankYouSlide.addText('Powered by Shark AI | IGYAN', {
      x: 0.5,
      y: 5.0,
      w: 9,
      h: 0.3,
      fontSize: 10,
      color: 'FFFFFF',
      align: 'center',
      fontFace: 'Arial',
    });

    const fileName = `${(title || 'Pitch_Deck').replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pptx`;
    await pptx.writeFile({ fileName });
    
    return fileName;
  } catch (error) {
    console.error('Error generating Shark PPT:', error);
    throw error;
  }
};

export { PITCH_SLIDES };
