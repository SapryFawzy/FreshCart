import { TranslatePipe } from '@ngx-translate/core';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-contact-us',
  imports: [RouterLink, FormsModule, TranslatePipe],
  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.css',
})
export class ContactUsComponent {
  isSending: WritableSignal<boolean> = signal(false);

  sendForm(form: HTMLFormElement) {
    this.isSending.set(true);
    setTimeout(() => {
      this.isSending.set(false);
      form.reset();
    }, 1000);
  }
}
