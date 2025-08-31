import {
  AbstractControlOptions,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';

type ControlValue<C> = C extends FormControl<infer V> ? V : never;
type FormKeys<T> = { [K in keyof T]-?: T[K] extends FormControl<any> ? K : never }[keyof T];
type ControlsOf<T> = { [K in FormKeys<T>]: FormControl<ControlValue<T[K]>> };

export type FieldValidators<T> = Partial<{
  [K in FormKeys<T>]:
    | ValidatorFn
    | AsyncValidatorFn
    | readonly (ValidatorFn | AsyncValidatorFn)[];
}>;

export function createFormGroupFromClass<T extends object>(
  Ctor: new () => T,
  opts?: { validators?: FieldValidators<T>; group?: AbstractControlOptions }
): FormGroup<ControlsOf<T>> {
  const instance = new Ctor();
  const controls = {} as Partial<ControlsOf<T>>;

  const toArray = <U>(v?: U | readonly U[]) =>
    v == null ? undefined : Array.isArray(v) ? [...v] : [v];

  const keys = Object.keys(instance) as FormKeys<T>[];
  for (const key of keys) {
    const rules = opts?.validators?.[key];
    const ruleArr = toArray(rules);
    (controls as any)[key] = new FormControl<ControlValue<T[typeof key]>>(null, ruleArr as any);
  }

  return new FormGroup(controls as ControlsOf<T>, opts?.group);
}

export function formKeysOf<T extends object>(Ctor: new () => T) {
  return Object.keys(new Ctor()) as FormKeys<T>[];
}
