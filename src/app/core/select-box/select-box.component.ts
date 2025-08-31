import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'select-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './select-box.component.html',
  styleUrls: ['./select-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => SelectBoxComponent), multi: true },
  ],
})
export class SelectBoxComponent<T = any> implements ControlValueAccessor {
  @Input() items: ReadonlyArray<T> = [];
  @Input({ required: true }) keyField!: string;
  @Input({ required: true }) labelField!: string;
  @Input() multiple = false;
  @Input() placeholder: string | undefined = 'Select…';
  @Input() allowEmpty = true;

  @Output() selectionChange = new EventEmitter<any>();

  disabled = false;
  modelValue: any = null;

  writeValue(value: any): void {
    this.modelValue = this.multiple ? (Array.isArray(value) ? [...value] : []) : (value ?? null);
  }
  registerOnChange(fn: (v: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  update(v: any): void {
    this.modelValue = this.multiple ? (Array.isArray(v) ? v : []) : (v ?? null);
    this.onChange(this.modelValue);
    this.onTouched();
    this.selectionChange.emit(this.modelValue);
  }

  getKey(item: T): any { return (item as any)?.[this.keyField]; }
  getLabel(item: T): string { return String((item as any)?.[this.labelField] ?? ''); }
  trackByKey = (_: number, item: T) => this.getKey(item);
}
