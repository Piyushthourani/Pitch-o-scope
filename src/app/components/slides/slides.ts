import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Idea } from '../../services/idea';
import { Slide } from '../../services/slide';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlideCard } from '../slide-card/slide-card';
import { Toast } from 'bootstrap';

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
    ).map(line => line.replace(/\*\*/g, '').replace(/^[-•*]\s?/, '').trim());

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
    const element = document.getElementById('pdf-content');
    if (!element) return;

    const options = {
      margin: 0.5,
      filename: 'pitch-deck.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    import('html2pdf.js').then((module) => {
      const html2pdf = module.default;
      html2pdf().from(element).set(options).save();
    });
  }
}

export interface SlideInterface {
  title: string;
  content: string[];
}
