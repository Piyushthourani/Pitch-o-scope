import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Idea {
  private idea: string = '';

  constructor() {
    // Load idea from localStorage if available
    const saved = localStorage.getItem('startupIdea');
    if (saved && saved.trim() !== '' && !this.isTestValue(saved)) {
      this.idea = saved;
    } else if (saved && this.isTestValue(saved)) {
      // Clear test values automatically
      localStorage.removeItem('startupIdea');
    }
  }

  private isTestValue(value: string): boolean {
    const testValues = [
      'an AI app that writes resumes',
      'An AI app that writes resumes',
      'AI app that writes resumes',
      'test',
      'example',
      'demo'
    ];
    return testValues.some(testValue => 
      value.toLowerCase().includes(testValue.toLowerCase())
    );
  }

  setIdea(idea: string) {
    this.idea = idea;
    if (idea.trim() === '') {
      localStorage.removeItem('startupIdea');
      localStorage.removeItem('slidesGenerated');
    } else {
      localStorage.setItem('startupIdea', idea);
    }
  }

  getIdea(): string {
    return this.idea;
  }

  clearIdea(): void {
    this.idea = '';
    localStorage.removeItem('startupIdea');
    localStorage.removeItem('slidesGenerated');
  }

  markSlidesGenerated(): void {
    localStorage.setItem('slidesGenerated', 'true');
  }

  hasGeneratedSlides(): boolean {
    return localStorage.getItem('slidesGenerated') === 'true';
  }
}
