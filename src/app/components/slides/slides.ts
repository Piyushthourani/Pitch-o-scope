import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Idea } from '../../services/idea';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlideCard } from '../slide-card/slide-card';
import { Toast } from 'bootstrap';
import { Slide } from '../../services/slide';

@Component({
  selector: 'app-slides',
  imports: [CommonModule, FormsModule, SlideCard],
  providers: [Slide, Idea],
  templateUrl: './slides.html',
  styleUrl: './slides.css'
})
export class Slides implements OnInit {
  startupIdea: string = '';
  loading = true;
  error = '';
  slides: SlideInterface[] = [];

  @ViewChild('toastRef') toastRef!: ElementRef;

  constructor(private ideaService: Idea, private slideService: Slide, private router: Router) {}

  ngOnInit() {
    this.startupIdea = this.ideaService.getIdea();
    if (!this.startupIdea) {
      this.error = '❌ No idea found. Please enter a startup idea first.';
      this.loading = false;
      return;
    }

    this.generateSlidesFromAI();
  }

  regenerateSlides(): void {
    this.loading = true;
    this.error = '';
    this.slides = [];
    this.generateSlidesFromAI();
  }

  generateSlidesFromAI(): void {
  this.slideService.generateSlides(this.startupIdea).subscribe({
    next: (res) => {
      const rawText = res.choices[0].message.content;
      this.slides = this.parseStructuredSlides(rawText);
      this.loading = false;

      const toastElement = new Toast(this.toastRef.nativeElement);
      toastElement.show();
    },
    error: (err) => {
      console.error(err);
      this.error = '⚠️ Failed to generate slides. Please try again.';
      this.loading = false;
    }
  });
}

  parseStructuredSlides(raw: string): SlideInterface[] {
  const matches = raw.match(/Slide \d+[\s\S]*?(?=(Slide \d+|$))/g) || [];
  const slides: SlideInterface[] = [];

  for (let block of matches) {
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean);

    const slideTitleLine = lines.find(l => l.includes('Slide')) || 'Slide';
    const titleLine = lines.find(l => l.startsWith('Title:')) || '';
    const title = titleLine.replace('Title:', '').replace(/\*\*/g, '').replace(/["']/g, '').trim() || slideTitleLine;

    const contentLines = lines.filter(line =>
      !line.includes('Slide') && !line.startsWith('Title:')
    ).map(line => line.replace(/\*\*/g, '').replace(/^[-•*]\s?/, '').trim())
    .filter(line => {
      // Filter out empty lines, single bullets, dashes, or meaningless content
      return line.length > 0 && 
             line !== '•' && 
             line !== '-' && 
             line !== '--' && 
             line !== '*' && 
             line !== '...' &&
             line.length > 2; // Require at least 3 characters for meaningful content
    });

    // ✅ Don't skip slides unless they're clearly empty
    if (contentLines.length === 0) continue;

    slides.push({ title, content: contentLines });
  }

  return slides;
}

  goBack(): void {
    this.router.navigate(['/idea']);
  }

  downloadPDF(): void {
    this.downloadPowerPointPPTX();
  }

  async downloadPowerPointPPTX(): Promise<void> {
    if (this.slides.length === 0) {
      console.error('No slides to export');
      return;
    }

    try {
      // Dynamically import PptxGenJS from CDN
      const PptxGenJS = await this.loadPptxGenJS();
      
      // Create new presentation
      const pres = new PptxGenJS();
      
      // Set presentation properties
      pres.author = 'Pitch-o-Scope AI';
      pres.company = 'Pitch-o-Scope';
      pres.subject = 'AI-Generated Pitch Deck';
      pres.title = 'Professional Pitch Deck';

      // Add title slide
      const titleSlide = pres.addSlide();
      
      // Title slide background
      titleSlide.background = { color: '1a237e' };
      
      // Main title
      titleSlide.addText('Professional Pitch Deck', {
        x: 1, y: 2, w: 8, h: 1.5,
        fontSize: 44,
        color: 'ffffff',
        bold: true,
        align: 'center',
        fontFace: 'Arial'
      });
      
      // Subtitle
      titleSlide.addText('AI-Generated Business Presentation', {
        x: 1, y: 3.5, w: 8, h: 1,
        fontSize: 24,
        color: 'ffffff',
        align: 'center',
        fontFace: 'Arial'
      });
      
      // Date
      titleSlide.addText(`Generated on: ${new Date().toLocaleDateString()}`, {
        x: 1, y: 5, w: 8, h: 0.5,
        fontSize: 16,
        color: 'ffffff',
        align: 'center',
        fontFace: 'Arial'
      });

      // Add startup idea slide
      const ideaSlide = pres.addSlide();
      ideaSlide.background = { color: 'ffffff' };
      
      // Startup idea title
      ideaSlide.addText('Startup Idea', {
        x: 0.5, y: 0.5, w: 9, h: 1,
        fontSize: 32,
        color: '1a237e',
        bold: true,
        fontFace: 'Arial'
      });
      
      // Startup idea content
      ideaSlide.addText(this.startupIdea, {
        x: 0.5, y: 1.5, w: 9, h: 4,
        fontSize: 18,
        color: '333333',
        fontFace: 'Arial',
        valign: 'top',
        wrap: true
      });

      // Add content slides
      this.slides.forEach((slide, index) => {
        const contentSlide = pres.addSlide();
        contentSlide.background = { color: 'ffffff' };
        
        // Slide header background
        contentSlide.addShape('rect', {
          x: 0, y: 0, w: 10, h: 1.2,
          fill: { color: '1a237e' }
        });
        
        // Slide number
        contentSlide.addText(`Slide ${index + 1} of ${this.slides.length}`, {
          x: 0.5, y: 0.1, w: 9, h: 0.4,
          fontSize: 12,
          color: 'ffffff',
          fontFace: 'Arial'
        });
        
        // Slide title
        contentSlide.addText(slide.title, {
          x: 0.5, y: 0.4, w: 9, h: 0.7,
          fontSize: 24,
          color: 'ffffff',
          bold: true,
          fontFace: 'Arial',
          valign: 'middle'
        });
        
        // Slide content as bullet points
        const bulletPoints = slide.content.map(point => ({
          text: point,
          options: { 
            fontSize: 16, 
            color: '333333',
            bullet: true,
            fontFace: 'Arial'
          }
        }));
        
        contentSlide.addText(bulletPoints, {
          x: 0.5, y: 1.5, w: 9, h: 4.5,
          fontSize: 16,
          color: '333333',
          fontFace: 'Arial'
        });
      });

      // Save the presentation
      const fileName = `pitch-deck-${new Date().toISOString().split('T')[0]}.pptx`;
      await pres.writeFile({ fileName });
      
      this.showDownloadSuccess();
      
    } catch (error) {
      console.error('PowerPoint generation failed:', error);
      // Fallback to HTML download
      this.downloadHTMLPresentation();
    }
  }

  private loadPptxGenJS(): Promise<any> {
    return new Promise((resolve, reject) => {
      if ((window as any).PptxGenJS) {
        resolve((window as any).PptxGenJS);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
      script.onload = () => {
        resolve((window as any).PptxGenJS);
      };
      script.onerror = () => {
        reject(new Error('Failed to load PptxGenJS library'));
      };
      document.head.appendChild(script);
    });
  }

  downloadPowerPoint(): void {
    if (this.slides.length === 0) {
      console.error('No slides to export');
      return;
    }

    // Create a comprehensive presentation document
    let content = '';
    
    // Add title page
    content += `PROFESSIONAL PITCH DECK\n`;
    content += `AI-Generated Business Presentation\n`;
    content += `Generated on: ${new Date().toLocaleDateString()}\n`;
    content += `\n${'='.repeat(50)}\n\n`;

    // Add startup idea
    content += `STARTUP IDEA:\n`;
    content += `${this.startupIdea}\n\n`;
    content += `${'='.repeat(50)}\n\n`;

    // Add each slide
    this.slides.forEach((slide, index) => {
      content += `SLIDE ${index + 1}: ${slide.title.toUpperCase()}\n`;
      content += `${'-'.repeat(40)}\n\n`;
      
      slide.content.forEach((point, pointIndex) => {
        content += `${pointIndex + 1}. ${point}\n`;
      });
      
      content += `\n${'='.repeat(50)}\n\n`;
    });

    // Add footer
    content += `\nTotal Slides: ${this.slides.length}\n`;
    content += `Created with Pitch-o-Scope AI\n`;

    // Create and download as text file (easily convertible to any format)
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pitch-deck-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    // Also create an HTML version for better formatting
    this.downloadHTMLPresentation();
  }

  private downloadHTMLPresentation(): void {
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Professional Pitch Deck</title>
        <style>
          @page { 
            margin: 1in; 
            size: letter;
          }
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: white;
            color: #333;
            line-height: 1.6;
          }
          .title-page {
            text-align: center;
            padding: 100px 0;
            border-bottom: 3px solid #1a237e;
            margin-bottom: 40px;
          }
          .title-page h1 {
            font-size: 36px;
            color: #1a237e;
            margin-bottom: 20px;
            font-weight: bold;
          }
          .title-page p {
            font-size: 18px;
            color: #666;
            margin: 10px 0;
          }
          .startup-idea {
            background: #f8f9fa;
            padding: 30px;
            border-left: 5px solid #1a237e;
            margin: 30px 0;
            border-radius: 5px;
          }
          .startup-idea h2 {
            color: #1a237e;
            margin-top: 0;
          }
          .slide {
            page-break-before: always;
            margin-bottom: 40px;
          }
          .slide-header {
            background: #1a237e;
            color: white;
            padding: 20px;
            margin-bottom: 20px;
            border-radius: 5px;
          }
          .slide-number {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;
          }
          .slide-title {
            font-size: 24px;
            font-weight: 600;
            margin: 0;
          }
          .slide-content {
            padding: 0 20px;
          }
          .slide-content ol {
            padding-left: 20px;
          }
          .slide-content li {
            margin-bottom: 15px;
            font-size: 16px;
            line-height: 1.7;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 14px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <!-- Title Page -->
        <div class="title-page">
          <h1>Professional Pitch Deck</h1>
          <p>AI-Generated Business Presentation</p>
          <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Startup Idea Section -->
        <div class="startup-idea">
          <h2>Startup Idea</h2>
          <p>${this.startupIdea}</p>
        </div>
    `;

    // Add each slide
    this.slides.forEach((slide, index) => {
      htmlContent += `
        <div class="slide">
          <div class="slide-header">
            <div class="slide-number">Slide ${index + 1} of ${this.slides.length}</div>
            <h2 class="slide-title">${slide.title}</h2>
          </div>
          <div class="slide-content">
            <ol>
              ${slide.content.map(point => `<li>${point}</li>`).join('')}
            </ol>
          </div>
        </div>
      `;
    });

    htmlContent += `
        <div class="footer">
          <p><strong>Total Slides:</strong> ${this.slides.length}</p>
          <p>Created with Pitch-o-Scope AI</p>
        </div>
      </body>
      </html>
    `;

    // Create and download HTML file
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pitch-deck-presentation-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    this.showDownloadSuccess();
  }

  private showDownloadSuccess(): void {
    if (this.toastRef) {
      const toastElement = new Toast(this.toastRef.nativeElement);
      toastElement.show();
    }
  }
}

export interface SlideInterface {
  title: string;
  content: string[];
}
