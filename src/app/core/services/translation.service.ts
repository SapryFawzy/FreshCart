import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private readonly translate = inject(TranslateService);
  private readonly platform_id = inject(PLATFORM_ID);

  changeLanguage(lang: 'ar' | 'en'): void {
    this.translate.use(lang);

    if (isPlatformBrowser(this.platform_id)) {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      localStorage.setItem('lang', lang);
    }
  }

  getCurrentLanguage(): 'ar' | 'en' {
    if (isPlatformBrowser(this.platform_id)) {
      return localStorage.getItem('lang') === 'ar' ? 'ar' : 'en';
    } else {
      return 'en';
    }
  }
}
