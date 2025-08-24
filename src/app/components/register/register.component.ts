import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  protected form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group(
      {
        username: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.matchPasswords('password', 'confirmPassword') },
    );
  }

  private matchPasswords(passKey: string, confirmKey: string) {
    return (group: AbstractControl): ValidationErrors | null => {
      const pass = group.get(passKey)?.value;
      const confirm = group.get(confirmKey)?.value;
      return pass && confirm && pass !== confirm
        ? { passwordsMismatch: true }
        : null;
    };
  }

  register(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Submit values (replace with your service call)
    const { username, email, password } = this.form.value;
    console.log('Register with:', { username, email, password });
  }
}
