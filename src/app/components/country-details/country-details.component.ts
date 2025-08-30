import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CountryDto, ProjectDto } from '@api/models';
import { Store } from '@ngrx/store';
import { ModalService } from 'app/core/modal/modal.service';
import { distinctUntilChanged, filter, first, withLatestFrom } from 'rxjs';

import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';

@Component({
  selector: 'app-country-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './country-details.component.html',
  styleUrl: './country-details.component.scss',
})
export class CountryDetailsComponent {
    private readonly store = inject(Store);
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly modal = inject(ModalService);
    private readonly destroyRef = inject(DestroyRef);
  
    @Input() projectId!: number;
    @Input() countryId!: number;
  
    protected selectedCountry?: CountryDto | null;
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
  
      const country$ = this.store
        .select(fromSelectors.getSelectedProjectProperty('countries', this.countryId))
        .pipe(
          filter((w): w is CountryDto => !!w),
          distinctUntilChanged(
            (a, b) =>
              a.id === b.id &&
              a.shortDescription === b.shortDescription &&
              a.longDescription === b.longDescription &&
              a.history === b.history
          )
        );
  
      country$
        .pipe(withLatestFrom(project$), takeUntilDestroyed(this.destroyRef))
        .subscribe(([country, project]) => {
          this.selectedProject = project;
          this.selectedCountry = country;
          
          this.form.reset(
            {
              shortDescription: country.shortDescription ?? '',
              longDescription: country.longDescription ?? '',
              history: country.history ?? ''
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
      if (!this.selectedProject || !this.selectedCountry) return;
      if (this.form.invalid || this.form.pristine) return;
  
      const { shortDescription, longDescription, history } = this.form.value;
  
      const updatedCountry: CountryDto = {
        ...this.selectedCountry,
        shortDescription,
        longDescription,
        history
      };
  
      const updatedCountries = (this.selectedProject.countries ?? []).map(w =>
        w.id === updatedCountry.id ? { ...w, ...updatedCountry } : w
      );
  
      this.store.dispatch(fromActions.UpdateProject({
        project: {
          ...this.selectedProject,
          countries: updatedCountries
        }
      }));
  
      this.form.markAsPristine();
      this.form.markAsUntouched();
    }
}
