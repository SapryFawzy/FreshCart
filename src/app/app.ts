import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './features/navbar/navbar.component';
import { FooterComponent } from './features/footer/footer.component';
import { TranslationService } from './core/services/translation.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('e-commarce-app');
  private readonly translateService = inject(TranslationService);
  private readonly platform_id = inject(PLATFORM_ID);
  constructor() {
    if (isPlatformBrowser(this.platform_id)) {
      const lang = localStorage.getItem('lang') === 'ar' ? 'ar' : 'en';
      this.translateService.changeLanguage(lang);
      document.documentElement.classList.toggle('app-dark', localStorage.getItem('theme') === 'dark');
    }
  }
}
