import { TranslatePipe } from '@ngx-translate/core';
import { Component } from '@angular/core';

@Component({
  selector: 'app-catgory',
  imports: [ TranslatePipe],
  templateUrl: './catgory.component.html',
  styleUrl: './catgory.component.css',
})
export class CatgoryComponent {}
