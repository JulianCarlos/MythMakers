import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { DialogModule } from '@angular/cdk/dialog';              // <-- add this
import { Router } from '@angular/router';
import { CharacterDto, ProjectDto } from '@api/models';
import { Store } from '@ngrx/store';
import { createFormGroupFromClass } from 'app/core/form-group.factory';
import { CharacterDetailFormType } from 'app/core/form-types/character-detail-form-type';
import { ModalService } from 'app/core/modal/modal.service';
import { SelectionGridComponent } from 'app/core/selection-grid/selection-grid.component';
import { filter, first, Observable, withLatestFrom } from 'rxjs';

import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';

@Component({
  selector: 'app-character-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIcon,
    DialogModule,                    // <-- required for SelectionGrid's CDK dialog
    SelectionGridComponent
  ],
  templateUrl: './character-details.component.html',
  styleUrl: './character-details.component.scss',
})
export class CharacterDetailsComponent {
  private readonly store = inject(Store);
  private readonly router = inject(Router);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() projectId!: number;
  @Input() characterId!: number;

  protected datasource!: Observable<readonly CharacterDto[]>;     // all available options
  protected selectedCharacter?: CharacterDto | null;
  private selectedProject?: ProjectDto | null;

  // The items currently shown in the grid (what you've “added”)
  protected selectedCharacters: readonly CharacterDto[] = [];

  // How to display each option/tile
  protected displayCharacter = (c: CharacterDto) =>
    c?.name ?? c?.nickName ?? `#${c?.id ?? ''}`;

  protected form = createFormGroupFromClass(CharacterDetailFormType, {
    validators: {
      height: Validators.min(0),
      weight: Validators.min(0),
    },
  });

  ngOnInit(): void {
    this.datasource = this.store.select(
      fromSelectors.getProjectsStateProjectProperty(this.projectId, 'characters')
    );

    const project$ = this.store
      .select(fromSelectors.getProjectsStateProjectById(this.projectId))
      .pipe(filter((p): p is ProjectDto => !!p));

    const character$ = this.store
      .select(fromSelectors.getSelectedProjectProperty('characters', this.characterId))
      .pipe(filter((w): w is CharacterDto => !!w));

    character$
      .pipe(withLatestFrom(project$), takeUntilDestroyed(this.destroyRef))
      .subscribe(([character, project]) => {
        this.selectedProject = project;
        this.selectedCharacter = character;

        // If your character already has related selections, hydrate them here:
        // this.selectedCharacters = character.relatedCharacters ?? [];

        this.form.reset({ ...character }, { emitEvent: false });
        this.form.markAsPristine();
        this.form.markAsUntouched();
      });
  }

  backToProject() {
    if (this.form.dirty) {
      this.modal
        .openConfirm({
          title: 'Unsaved Changes?',
          message: 'You have unsaved changes. Are you sure you want to leave without saving?',
          confirmLabel: 'Confirm',
          cancelLabel: 'Cancel',
          danger: true,
        })
        .pipe(first())
        .subscribe((confirmed) => {
          if (!confirmed) return;
          this.router.navigate(['/overview/project', this.projectId]);
        });
    } else {
      this.router.navigate(['/overview/project', this.projectId]);
    }
  }

  applyChanges() {
    if (!this.selectedProject || !this.selectedCharacter) return;
    if (this.form.invalid || this.form.pristine) return;

    const updatedCharacter: CharacterDto = {
      ...this.selectedCharacter,
      ...this.form.value,
      // Persist the grid selection if you have a field for it:
      // relatedCharacters: this.selectedCharacters,
    };

    const updatedCharacters = (this.selectedProject.characters ?? []).map((w) =>
      w.id === updatedCharacter.id ? { ...w, ...updatedCharacter } : w
    );

    this.store.dispatch(
      fromActions.UpdateProject({
        project: {
          ...this.selectedProject,
          characters: updatedCharacters,
        },
      })
    );

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
