import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Slides } from './components/slides/slides';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'slides', component: Slides },
  { path: '**', redirectTo: '' }  // fallback route
];
