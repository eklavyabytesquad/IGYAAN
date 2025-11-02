'use client';

import PptxGenJS from 'pptxgenjs';

export const generatePPT = async (content, title, template) => {
  try {
    const pptx = new PptxGenJS();
    
    pptx.author = 'igyan AI';
    pptx.title = title || 'AI Generated Presentation';
    pptx.subject = 'Created by Content Generator';

    // Title Slide
    let slide = pptx.addSlide();
    slide.background = { color: template.colors.primary };
    
    slide.addText(title || 'AI Generated Presentation', {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 1.5,
      fontSize: template.fontSizes.title,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
    });
    
    slide.addText('Powered by igyan AI', {
      x: 0.5,
      y: 4.5,
      w: 9,
      h: 0.5,
      fontSize: 18,
      color: 'FFFFFF',
      align: 'center',
    });

    // Content slides
    const sections = content.split('\n\n').filter(section => section.trim());
    
    sections.forEach((section, index) => {
      const slide = pptx.addSlide();
      slide.background = { color: template.colors.background };
      
      const lines = section.split('\n');
      const hasTitle = lines[0].includes(':') || lines[0].startsWith('#');
      
      if (hasTitle) {
        const titleText = lines[0].replace('#', '').replace(':', '').trim();
        const bodyText = lines.slice(1).join('\n').trim();
        
        slide.addText(titleText, {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 1,
          fontSize: template.fontSizes.heading,
          bold: true,
          color: template.colors.primary,
        });
        
        if (bodyText) {
          slide.addText(bodyText, {
            x: 0.5,
            y: 1.8,
            w: 9,
            h: 4,
            fontSize: template.fontSizes.body,
            color: template.colors.text,
            valign: 'top',
          });
        }
      } else {
        slide.addText(section.trim(), {
          x: 0.5,
          y: 1,
          w: 9,
          h: 5,
          fontSize: template.fontSizes.body,
          color: template.colors.text,
          valign: 'top',
        });
      }
      
      // Slide number with accent color
      slide.addText(`${index + 2}`, {
        x: 9.3,
        y: 7,
        w: 0.5,
        h: 0.3,
        fontSize: 12,
        color: template.colors.accent,
      });
    });

    const fileName = `${title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pptx`;
    await pptx.writeFile({ fileName });
    
    return fileName;
  } catch (error) {
    console.error('Error generating PPT:', error);
    throw error;
  }
};
