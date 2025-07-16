import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class Slide {
  private apiUrl = 'https://openrouter.ai/api/v1/chat/completions';  // API endpoint
  private apiKey = environment.openRouterApiKey; // 🔒 Replace this with environment variable later

  constructor(private http: HttpClient) {}

  generateSlides(startupIdea: string): Observable<any> {
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    });

    const body = {
      model: "deepseek/deepseek-chat:free", // or "openai/gpt-3.5-turbo" (whichever free)
      messages: [
        {
          role: 'system',
          content: 'You are an expert pitch deck generator. Generate a pitch deck based on the user’s idea with the following slides: Problem, Solution, Market Opportunity, Business Model, Monetization, Competitive Advantage, Tech Stack, Vision.'
        },
        {
          role: 'user',
          content: `Startup Idea: ${startupIdea}`
        }
      ]
    };

    return this.http.post(this.apiUrl, body, { headers });
  }
  
}