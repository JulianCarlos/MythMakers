import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CityDto, ProjectDto } from '@api/models';
import { Store } from '@ngrx/store';
import { ModalService } from 'app/core/modal/modal.service';
import { distinctUntilChanged, filter, first, withLatestFrom } from 'rxjs';

import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';

@Component({
  selector: 'app-city-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './city-details.component.html',
  styleUrl: './city-details.component.scss',
})
export class CityDetailsComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() projectId!: number;
  @Input() cityId!: number;

  protected selectedCity?: CityDto | null;
  private selectedProject?: ProjectDto | null;

  protected form: FormGroup = this.fb.group({ 
    shortDescription: [''],
    longDescription: [''],
    history: [''] 
  });

  ngOnInit(): void {
    const project$ = this.store
      .select(fromSelectors.getProjectsStateProjectById(this.projectId))
      .pipe(filter((p): p is ProjectDto => !!p));

    const city$ = this.store
      .select(fromSelectors.getSelectedProjectProperty('cities', this.cityId))
      .pipe(
        filter((w): w is CityDto => !!w),
        distinctUntilChanged(
          (a, b) =>
            a.id === b.id &&
            a.shortDescription === b.shortDescription &&
            a.longDescription === b.longDescription &&
            a.history === b.history
        )
      );

    city$
      .pipe(withLatestFrom(project$), takeUntilDestroyed(this.destroyRef))
      .subscribe(([city, project]) => {
        this.selectedProject = project;
        this.selectedCity = city;
        
        this.form.reset(
          {
            shortDescription: city.shortDescription ?? '',
            longDescription: city.longDescription ?? '',
            history: city.history ?? ''
          },
          { emitEvent: false }
        );
      });
  }

  backToProject() {
    if (this.form.dirty) {
      this.modal.openConfirm({
          title: 'Unsaved Changes?',
          message: `You have unsaved changes. Are you sure you want to leave without saving?`,
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
          danger: true,
      })
      .pipe(first())
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.router.navigate(['/overview/project', this.projectId]);
      });
    }
    else {
      this.router.navigate(['/overview/project', this.projectId]);
    }
  }

  applyChanges() {
    if (!this.selectedProject || !this.selectedCity) return;
    if (this.form.invalid || this.form.pristine) return;

    const updatedCity: CityDto = {
      ...this.selectedCity,
      ...this.form.value,
    };

    const updatedCities = (this.selectedProject.cities ?? []).map(w =>
      w.id === updatedCity.id ? { ...w, ...updatedCity } : w
    );

    this.store.dispatch(fromActions.UpdateProject({
      project: {
        ...this.selectedProject,
        cities: updatedCities
      }
    }));

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
