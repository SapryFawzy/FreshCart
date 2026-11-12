import { TranslatePipe } from '@ngx-translate/core';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-error-msg',
  imports: [ TranslatePipe],
  templateUrl: './error-msg.component.html',
  styleUrl: './error-msg.component.css',
})
export class ErrorMsgComponent {
  errorMsg = input<string>('');
}
