import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlideCard } from './slide-card';

describe('SlideCard', () => {
  let component: SlideCard;
  let fixture: ComponentFixture<SlideCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SlideCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
