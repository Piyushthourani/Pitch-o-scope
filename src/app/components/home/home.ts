import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Idea } from '../../services/idea';

@Component({
  selector: 'app-home',
  imports: [FormsModule, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home {
  startupIdea: string = '';

  constructor(
    private router: Router,
    private ideaService: Idea
  ) {}

  submitIdea() {
    if (this.startupIdea.trim()) {
      this.ideaService.setIdea(this.startupIdea);
      this.router.navigate(['/slides']);
    }
  }
}
