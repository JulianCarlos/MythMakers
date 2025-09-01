import {
  AbstractControlOptions,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ValidatorFn,
} from '@angular/forms';

// ---------- your existing helper types ----------
type ControlValue<C> = C extends FormControl<infer V> ? V : never;
type FormKeys<T> = { [K in keyof T]-?: T[K] extends FormControl<any> ? K : never }[keyof T];
type ControlsOf<T> = { [K in FormKeys<T>]: FormControl<ControlValue<T[K]>> };

export type FieldValidators<T> = Partial<{
  [K in FormKeys<T>]:
    | ValidatorFn
    | AsyncValidatorFn
    | readonly (ValidatorFn | AsyncValidatorFn)[];
}>;

// ---------- NEW: overrides support ----------
type ControlOverrideFactory<V> = FormControl<V> | (() => FormControl<V>);
type ControlOverrides<T> = Partial<{ [K in FormKeys<T>]: ControlOverrideFactory<any> }>;

type ExtractOverrideValue<F> =
  F extends FormControl<infer V> ? V :
  F extends () => FormControl<infer V> ? V :
  never;

type ControlsOfWithOverrides<T, O extends ControlOverrides<T>> = {
  [K in FormKeys<T>]:
    FormControl<
      K extends keyof O
        ? ExtractOverrideValue<NonNullable<O[K]>>
        : ControlValue<T[K]>
    >
};

// ---------- UPDATED helper ----------
export function createFormGroupFromClass<
  T extends object,
  O extends ControlOverrides<T> = {}
>(
  Ctor: new () => T,
  opts?: {
    overrides?: O;
    validators?: FieldValidators<T>;
    group?: AbstractControlOptions;
  }
): FormGroup<ControlsOfWithOverrides<T, O>> {
  const instance = new Ctor();
  const controls = {} as Partial<ControlsOfWithOverrides<T, O>>;

  const toArray = <U>(v?: U | readonly U[]) =>
    v == null ? undefined : Array.isArray(v) ? [...v] : [v];

  const keys = Object.keys(instance) as FormKeys<T>[];
  for (const key of keys) {
    const rules = opts?.validators?.[key];
    const ruleArr = toArray(rules);

    const override = opts?.overrides?.[key] as ControlOverrideFactory<any> | undefined;

    if (override) {
      // use the provided control or factory-produced control
      const ctrl = typeof override === 'function' ? (override as () => FormControl<any>)() : override;
      if (ruleArr?.length) {
        // attach validators on top of whatever the override has
        (ctrl as FormControl).addValidators(ruleArr as any);
      }
      (controls as any)[key] = ctrl;
    } else {
      // default: make a control typed from the class property
      (controls as any)[key] = new FormControl<any>(null, ruleArr as any);
    }
  }

  return new FormGroup(controls as ControlsOfWithOverrides<T, O>, opts?.group);
}

// unchanged
export function formKeysOf<T extends object>(Ctor: new () => T) {
  return Object.keys(new Ctor()) as FormKeys<T>[];
}
