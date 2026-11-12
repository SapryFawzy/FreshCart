import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatgoryComponent } from './catgory.component';

describe('CatgoryComponent', () => {
  let component: CatgoryComponent;
  let fixture: ComponentFixture<CatgoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatgoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CatgoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
