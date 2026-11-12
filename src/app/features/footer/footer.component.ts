import { TranslatePipe } from '@ngx-translate/core';
import { Component, signal, WritableSignal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent {
  currentYear : WritableSignal<number> = signal(new Date().getFullYear());
}
