import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';

export interface ConfirmData {
  title: string;                 // e.g. "Delete project?"
  message?: string;              // optional supporting text
  confirmLabel?: string;         // default: "Confirm"
  cancelLabel?: string;          // default: "Cancel"
  danger?: boolean;              // if true, confirm button is red
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="panel" role="dialog" cdkTrapFocus>
      <div class="header">
        <h2>{{ data.title }}</h2>
      </div>

      <div class="body">
        <p *ngIf="data.message">{{ data.message }}</p>
      </div>

      <div class="footer">
        <button type="button" class="btn btn-ghost" cdkFocusInitial (click)="cancel()">
          {{ data.cancelLabel || 'Cancel' }}
        </button>
        <button type="button"
                class="btn"
                [class.btn-primary]="!data.danger"
                [class.btn-danger]="data.danger"
                (click)="confirm()">
          {{ data.confirmLabel || 'Confirm' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display:block; }

    /* Panel (same look as the text prompt) */
    .panel {
      width: min(92vw, 520px);
      background: #333;
      color: #f3f4f6;
      border-radius: 14px;
      border: 1px solid #3d3d3d;
      box-shadow:
        0 20px 50px rgba(0,0,0,.45),
        0 2px 6px rgba(0,0,0,.3);
      display: grid;
      grid-template-rows: auto 1fr auto;
      overflow: hidden;
      animation: pop-in 160ms cubic-bezier(.2,.9,.2,1);
      backdrop-filter: saturate(120%) blur(0.5px);
      transform-origin: center;
    }

    .header { padding: 16px 18px; border-bottom: 1px solid #3d3d3d; }
    .header h2 { margin:0; font-size: 18px; font-weight: 600; letter-spacing: .2px; }

    .body { padding: 16px 18px; display: grid; gap: 10px; }
    .footer {
      padding: 12px 12px;
      border-top: 1px solid #3d3d3d;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0));
    }

    .btn {
      appearance: none;
      border: 1px solid transparent;
      border-radius: 10px;
      padding: 8px 14px;
      font-size: 14px;
      cursor: pointer;
      transition: transform .06s ease, box-shadow .15s ease, background .15s ease, border-color .15s ease;
      will-change: transform;
    }
    .btn:active { transform: translateY(1px); }

    .btn-ghost {
      background: #3a3a3a;
      border-color: #4a4a4a;
      color: #e5e7eb;
    }
    .btn-ghost:hover { background: #3f3f3f; }

    .btn-primary {
      background: linear-gradient(180deg, #4f8cff, #3977ea);
      color: white;
      box-shadow: 0 6px 16px rgba(63,125,255,.35);
      border-color: #5c93ff;
    }
    .btn-primary:hover {
      box-shadow: 0 8px 20px rgba(63,125,255,.45);
      filter: saturate(1.05);
    }

    .btn-danger {
      background: linear-gradient(180deg, #ff6161, #e33a3a);
      color: #fff;
      border-color: #ff6f6f;
      box-shadow: 0 6px 16px rgba(255,97,97,.35);
    }
    .btn-danger:hover {
      box-shadow: 0 8px 20px rgba(255,97,97,.45);
      filter: saturate(1.05);
    }

    @keyframes pop-in {
      from { opacity: 0; transform: translateY(6px) scale(.98); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    @media (prefers-reduced-motion: reduce) {
      .panel { animation: none; }
      .btn { transition: none !important; }
    }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    private ref: DialogRef<boolean>,
    @Inject(DIALOG_DATA) public data: ConfirmData
  ) {}

  cancel()  { this.ref.close(false); }
  confirm() { this.ref.close(true);  }
}
