import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Idea } from '../../services/idea';
import { Slide } from '../../services/slide';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SlideCard } from '../slide-card/slide-card';

@Component({
  selector: 'app-slides',
  imports: [CommonModule, FormsModule, SlideCard],
  templateUrl: './slides.html',
  styleUrl: './slides.css'
})
export class Slides implements OnInit {
  startupIdea: string = '';
  loading = true;
  error = '';
  slides: SlideInterface[] = []; // store raw AI output


  constructor(private ideaService: Idea, private slideService: Slide) {}

  ngOnInit() {
    this.startupIdea = this.ideaService.getIdea();

    if (!this.startupIdea) {
      this.error = '❌ No idea found. Please enter a startup idea first.';
      this.loading = false;
      return;
    }

    this.slideService.generateSlides(this.startupIdea).subscribe({
      next: (res) => {
        const rawText = res.choices[0].message.content;
        this.slides = this.parseStructuredSlides(rawText);
        this.loading = false;
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

    // Extract Slide Title
    const slideTitleLine = lines.find(l => l.includes('Slide')) || 'Slide';
    const titleLine = lines.find(l => l.startsWith('Title:')) || '';
    const title = titleLine.replace('Title:', '').replace(/\*\*/g, '').replace(/["']/g, '').trim() || slideTitleLine;

    // Extract other content lines
    const contentLines = lines.filter(line =>
      !line.includes('Slide') && !line.startsWith('Title:')
    ).map(line => line.replace(/\*\*/g, '').replace(/^[-•*]\s?/, '').trim());

    // Skip if this is just a dummy slide (like "Slide 1\nPitch Deck...")
    if (contentLines.length < 2 && title.toLowerCase().includes('pitch deck')) continue;

    // Skip closing thank you slide
    if (title.toLowerCase().includes('closing') || contentLines.join(' ').toLowerCase().includes('thank you')) continue;

    slides.push({ title, content: contentLines });
  }

  return slides;
}

}
export interface SlideInterface {
  title: string;
  content: string[];
}
