import { TranslatePipe } from '@ngx-translate/core';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-newsletter',
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './newsletter.component.html',
  styleUrl: './newsletter.component.css',
})
export class NewsletterComponent {
  private readonly fb = inject(FormBuilder);
  newsLetterSubscribtion = this.fb.group({
    email: ['', [Validators.email]],
  });
  message: WritableSignal<string> = signal('');

  subscribe(): void {
    if (!this.newsLetterSubscribtion.get('email')?.value?.trim()) return;
    // Logic
    this.message.set('UI.THANKS_FOR_SUBSCRIBING');
    this.newsLetterSubscribtion.get('email')?.reset('');
  }
}
