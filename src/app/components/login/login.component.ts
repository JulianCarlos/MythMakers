import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  protected form: FormGroup;
  protected loginError: string | null = null;

  private mockUser = {
    username: 'Test',
    password: '123123123'
  };

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  login(): void {
    this.loginError = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { username, password } = this.form.value;

    if (username === this.mockUser.username && password === this.mockUser.password) {
      alert('Login successful! 🎉 (Mock)');
    } else {
      this.loginError = 'Invalid username or password';
    }
  }
}
