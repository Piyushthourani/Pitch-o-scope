import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Idea } from '../../services/idea';

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  startupIdea: string = '';
  hasGeneratedSlides: boolean = false;

  constructor(
    private router: Router,
    private ideaService: Idea
  ) {}

  ngOnInit() {
    // Force clear any test values
    this.clearTestValues();
    
    // Load existing idea if available
    const existingIdea = this.ideaService.getIdea();
    if (existingIdea) {
      this.startupIdea = existingIdea;
      // Check if slides have been generated before
      this.hasGeneratedSlides = this.ideaService.hasGeneratedSlides();
    }
  }

  private clearTestValues() {
    const currentValue = localStorage.getItem('startupIdea');
    if (currentValue && currentValue.toLowerCase().includes('ai app that writes resumes')) {
      localStorage.removeItem('startupIdea');
      this.ideaService.clearIdea();
    }
  }

  submitIdea() {
    if (this.startupIdea.trim()) {
      this.ideaService.setIdea(this.startupIdea);
      this.ideaService.markSlidesGenerated();
      this.router.navigate(['/slides']);
    }
  }

  clearIdea() {
    this.startupIdea = '';
    this.hasGeneratedSlides = false;
    this.ideaService.clearIdea();
  }

  fillSuggestion(suggestion: string) {
    this.startupIdea = suggestion;
  }
}
