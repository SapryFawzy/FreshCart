import { TranslatePipe } from '@ngx-translate/core';
import { Component, ElementRef, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ErrorMsgComponent } from '../../../shared/ui/error-msg/error-msg.component';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signin',
  imports: [RouterLink, ErrorMsgComponent, ReactiveFormsModule, TranslatePipe],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css',
})
export class SigninComponent {
  private readonly auth = inject(AuthService);
  private readonly toastr = inject(ToastrService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  rememberMeInput = viewChild<ElementRef<HTMLInputElement>>('rememberMe');
  loading: WritableSignal<boolean> = signal(false);
  signinForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)]],
  });

  submit(): void {
    if (this.signinForm.valid) {
      this.loading.set(true);
      this.auth.signin(this.signinForm.value).subscribe((res: any) => {
        this.toastr.success(res.message,'Fresh Cart');
        const rememberMeInput: boolean | undefined = this.rememberMeInput()?.nativeElement.checked;
        if (rememberMeInput) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        } else {
          sessionStorage.setItem('token', res.token);
          sessionStorage.setItem('user', JSON.stringify(res.user));
        }
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 500);
      });
    } else {
      this.signinForm.markAllAsTouched();
    }
  }

  togglePassword(e: HTMLInputElement, icon: HTMLElement): void {
    if (e.type === 'password') icon.classList.replace('fa-eye-slash', 'fa-eye');
    else icon.classList.replace('fa-eye', 'fa-eye-slash');
    e.type = e.type === 'password' ? 'text' : 'password';
  }
}
