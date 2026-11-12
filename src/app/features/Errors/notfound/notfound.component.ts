import { TranslatePipe } from '@ngx-translate/core';
import { Location } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-notfound',
  imports: [RouterLink, TranslatePipe],
  templateUrl: './notfound.component.html',
  styleUrl: './notfound.component.css',
})
export class NotfoundComponent {
  private readonly location = inject(Location);

  goBack() {
    this.location.back();
  }
}
