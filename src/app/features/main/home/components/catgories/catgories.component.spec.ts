import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CatgoriesComponent } from './catgories.component';

describe('CatgoriesComponent', () => {
  let component: CatgoriesComponent;
  let fixture: ComponentFixture<CatgoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatgoriesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CatgoriesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
