import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

export interface TextPromptData {
  title: string;
  placeholder?: string;
  initialValue?: string;
  applyLabel?: string;
  discardLabel?: string;
}

@Component({
  selector: 'app-text-prompt-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="panel" role="dialog" cdkTrapFocus>
      <div class="header">
        <h2>{{ data.title }}</h2>
      </div>

      <div class="body">
        <input
          type="text"
          [placeholder]="data.placeholder || 'Type here...'"
          [formControl]="inputCtrl"
          cdkFocusInitial
          autocomplete="off"
          [attr.aria-invalid]="inputCtrl.invalid ? 'true' : 'false'"
        />
      </div>

      <div class="footer">
        <button type="button" class="btn btn-ghost" (click)="discard()">
          {{ data.discardLabel || 'Discard' }}
        </button>
        <button
          type="button"
          class="btn btn-primary"
          [disabled]="inputCtrl.invalid"
          (click)="apply()"
        >
          {{ data.applyLabel || 'Apply' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .panel {
        width: min(92vw, 520px);
        background: #333;
        color: #f3f4f6;
        border-radius: 14px;
        border: 1px solid #3d3d3d;
        box-shadow:
          0 20px 50px rgba(0, 0, 0, 0.45),
          0 2px 6px rgba(0, 0, 0, 0.3);
        display: grid;
        grid-template-rows: auto 1fr auto;
        overflow: hidden;
        animation: pop-in 160ms cubic-bezier(0.2, 0.9, 0.2, 1);
        backdrop-filter: saturate(120%) blur(0.5px);
        transform-origin: center;
      }

      .header {
        padding: 16px 18px;
        border-bottom: 1px solid #3d3d3d;
      }
      .header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        letter-spacing: 0.2px;
      }

      .body {
        padding: 16px 18px;
        display: grid;
        gap: 10px;
      }
      .footer {
        padding: 12px 12px;
        border-top: 1px solid #3d3d3d;
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        background: linear-gradient(
          180deg,
          rgba(255, 255, 255, 0.02),
          rgba(255, 255, 255, 0)
        );
      }

      input[type='text'] {
        width: 100%;
        height: 40px;
        padding: 0 12px;
        border-radius: 10px;
        border: 1px solid #4a4a4a;
        background: #2a2a2a;
        color: #f3f4f6;
        outline: none;
        font-size: 14px;
        transition:
          border-color 0.15s ease,
          box-shadow 0.15s ease,
          background 0.15s ease;
      }
      input[type='text']::placeholder {
        color: #9aa0a6;
      }
      input[type='text']:focus {
        border-color: #6ea8ff;
        box-shadow: 0 0 0 3px rgba(110, 168, 255, 0.22);
        background: #262626;
      }

      .btn {
        appearance: none;
        border: 1px solid transparent;
        border-radius: 10px;
        padding: 8px 14px;
        font-size: 14px;
        cursor: pointer;
        transition:
          transform 0.06s ease,
          box-shadow 0.15s ease,
          background 0.15s ease,
          border-color 0.15s ease;
        will-change: transform;
      }
      .btn:active {
        transform: translateY(1px);
      }

      .btn-ghost {
        background: #3a3a3a;
        border-color: #4a4a4a;
        color: #e5e7eb;
      }
      .btn-ghost:hover {
        background: #3f3f3f;
      }

      .btn-primary {
        background: linear-gradient(180deg, #4f8cff, #3977ea);
        color: white;
        box-shadow: 0 6px 16px rgba(63, 125, 255, 0.35);
        border-color: #5c93ff;
      }
      .btn-primary:disabled {
        opacity: 0.6;
        box-shadow: none;
        cursor: not-allowed;
      }
      .btn-primary:not(:disabled):hover {
        box-shadow: 0 8px 20px rgba(63, 125, 255, 0.45);
        filter: saturate(1.05);
      }

      @keyframes pop-in {
        from {
          opacity: 0;
          transform: translateY(6px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .panel {
          animation: none;
        }
        .btn,
        input {
          transition: none !important;
        }
      }
    `,
  ],
})
export class TextPromptDialogComponent {
  inputCtrl = new FormControl('', Validators.required);

  constructor(
    public ref: DialogRef<string | undefined>,
    @Inject(DIALOG_DATA) public data: TextPromptData,
  ) {
    if (data.initialValue) {
      this.inputCtrl.setValue(data.initialValue);
    }
  }

  discard() {
    this.ref.close(undefined);
  }

  apply() {
    const value = this.inputCtrl.value?.trim();
    if (!value) return;
    this.ref.close(value);
  }
}
