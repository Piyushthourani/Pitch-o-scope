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

  constructor(
    private router: Router,
    private ideaService: Idea
  ) {}

  ngOnInit() {
    // Load existing idea if available
    const existingIdea = this.ideaService.getIdea();
    if (existingIdea) {
      this.startupIdea = existingIdea;
    }
  }

  submitIdea() {
    if (this.startupIdea.trim()) {
      this.ideaService.setIdea(this.startupIdea);
      this.router.navigate(['/slides']);
    }
  }

  clearIdea() {
    this.startupIdea = '';
    this.ideaService.setIdea('');
  }

  fillSuggestion(suggestion: string) {
    this.startupIdea = suggestion;
  }
}
