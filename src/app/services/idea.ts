import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Idea {
  private idea: string = '';

  constructor() {
    // Load idea from localStorage if available
    const saved = localStorage.getItem('startupIdea');
    if (saved) this.idea = saved;
  }

  setIdea(idea: string) {
    this.idea = idea;
    localStorage.setItem('startupIdea', idea);  // Persist on refresh
  }

  getIdea(): string {
    return this.idea;
  }
}
