import { TranslatePipe } from '@ngx-translate/core';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollReveal } from '../../../../../shared/directives/scroll-reveal';

@Component({
  selector: 'app-features',
  imports: [RouterLink, ScrollReveal, TranslatePipe],
  templateUrl: './features.component.html',
  styleUrl: './features.component.css',
})
export class FeaturesComponent {

}
