import { TranslatePipe } from '@ngx-translate/core';
import { Component, ElementRef, inject, signal, viewChild, WritableSignal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ErrorMsgComponent } from '../../../shared/ui/error-msg/error-msg.component';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-signup',
  imports: [RouterLink, ReactiveFormsModule, ErrorMsgComponent, TranslatePipe],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
})
export class SignupComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly toastr = inject(ToastrService);
  termsInput = viewChild<ElementRef<HTMLInputElement>>('terms');
  creating: WritableSignal<boolean> = signal(false);
  sinupForm: FormGroup = this.fb.group(
    {
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/)],
      ],
      rePassword: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^01[0125][0-9]{8}$/)]],
    },
    {
      validators: this.passwordMatchValidator.bind(this),
    },
  );

  submit(): void {
    if (this.sinupForm.valid && this.termsInput()?.nativeElement.checked) {
      this.creating.set(true);
      this.auth.signup(this.sinupForm.value).subscribe((res : any) => {
        this.toastr.success(res.message,'Fresh Cart');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 500);
      });
    } else {
      this.sinupForm.markAllAsTouched();
    }
  }

  togglePassword(e: HTMLInputElement, icon: HTMLElement): void {
    if (e.type === 'password') icon.classList.replace('fa-eye-slash', 'fa-eye');
    else icon.classList.replace('fa-eye', 'fa-eye-slash');
    e.type = e.type === 'password' ? 'text' : 'password';
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const rePassword = form.get('rePassword')?.value;
    if (form.get('password')?.touched && form.get('rePassword')?.touched) {
      if (!password || !rePassword) {
        return null;
      }
      return password === rePassword ? null : { mismatch: true };
    }
    return null;
  }

  get passwordStrength(): { label: string; color: string; width: string } {
    const password = this.sinupForm.get('password')?.value || '';
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const levels = [
      { label: 'UI.VERY_WEAK', color: 'bg-red-500', width: '20' },
      { label: 'UI.WEAK', color: 'bg-orange-500', width: '40' },
      { label: 'UI.MEDIUM', color: 'bg-yellow-500', width: '60' },
      { label: 'UI.STRONG', color: 'bg-blue-500', width: '80' },
      { label: 'UI.VERY_STRONG', color: 'bg-green-500', width: '100' },
    ];
    return score === 0
      ? { label: 'UI.VERY_VERY_WEAK', color: 'bg-gray-200', width: '0' }
      : levels[score - 1];
  }
}
