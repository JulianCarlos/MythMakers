import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectDto, WorldDto } from '@api/models';
import { Store } from '@ngrx/store';
import { ModalService } from 'app/core/modal/modal.service';
import { distinctUntilChanged, filter, first, take, withLatestFrom } from 'rxjs';

import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';

@Component({
  selector: 'app-world-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './world-details.component.html',
  styleUrl: './world-details.component.scss',
})
export class WorldDetailsComponent implements OnInit {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() projectId!: number;
  @Input() worldId!: number;

  protected selectedWorld?: WorldDto | null;
  private selectedProject?: ProjectDto | null;

  protected form: FormGroup = this.fb.group({ 
    shortDescription: [''],
    longDescription: ['']  
  });

  ngOnInit(): void {
    const project$ = this.store
      .select(fromSelectors.getProjectsStateProjectById(this.projectId))
      .pipe(filter((p): p is ProjectDto => !!p));

    const world$ = this.store
      .select(fromSelectors.getSelectedProjectProperty('worlds', this.worldId))
      .pipe(
        filter((w): w is WorldDto => !!w),
        distinctUntilChanged(
          (a, b) =>
            a.id === b.id &&
            a.shortDescription === b.shortDescription &&
            a.longDescription === b.longDescription
        )
      );

    world$
      .pipe(withLatestFrom(project$), takeUntilDestroyed(this.destroyRef))
      .subscribe(([world, project]) => {
        this.selectedProject = project;
        this.selectedWorld = world;

        this.form.reset(
          {
            shortDescription: world.shortDescription ?? '',
            longDescription: world.longDescription ?? ''
          },
          { emitEvent: false }
        );
      });
  }

  applyChanges() {
    if (!this.selectedProject || !this.selectedWorld) return;
    if (this.form.invalid || this.form.pristine) return;

    const { shortDescription, longDescription } = this.form.value;

    const updatedWorld: WorldDto = {
      ...this.selectedWorld,
      shortDescription,
      longDescription,
    };

    const updatedWorlds = (this.selectedProject.worlds ?? []).map(w =>
      w.id === updatedWorld.id ? { ...w, ...updatedWorld } : w
    );

    this.store.dispatch(fromActions.UpdateProject({
      project: {
        ...this.selectedProject,
        worlds: updatedWorlds
      }
    }));

    this.form.markAsPristine();
    this.form.markAsUntouched();
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
}
