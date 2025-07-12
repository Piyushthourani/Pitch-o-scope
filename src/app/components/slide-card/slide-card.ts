import { Component, Input } from '@angular/core';
import { SlideInterface } from '../slides/slides';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-slide-card',
  imports: [CommonModule],
  templateUrl: './slide-card.html',
  styleUrl: './slide-card.css'
})
export class SlideCard {
  @Input() slide!: SlideInterface;
}
