import { Injectable } from '@angular/core';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import english from '../i18n/en.json';
import arabic from '../i18n/ar.json';

@Injectable({ providedIn: 'root' })
export class JsonTranslationLoader extends TranslateLoader {
  override getTranslation(lang: string): Observable<TranslationObject> {
    return of(lang === 'ar' ? arabic : english);
  }
}
