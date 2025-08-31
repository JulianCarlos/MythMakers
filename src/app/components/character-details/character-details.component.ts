import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { Router } from '@angular/router';
import { CharacterDto, ProjectDto } from '@api/models';
import { Store } from '@ngrx/store';
import { ModalService } from 'app/core/modal/modal.service';
import { filter, first, withLatestFrom } from 'rxjs';

import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';

@Component({
  selector: 'app-character-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIcon
  ],
  templateUrl: './character-details.component.html',
  styleUrl: './character-details.component.scss',
})
export class CharacterDetailsComponent {
  private readonly store = inject(Store);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly modal = inject(ModalService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() projectId!: number;
  @Input() characterId!: number;

  protected selectedCharacter?: CharacterDto | null;
  private selectedProject?: ProjectDto | null;

  protected form: FormGroup = this.fb.group({ 
    nickName: [''],
    description: [''],
    role: [''],
    race: [''],
    alignment: [''],
    height: [''],
    weight: [''],
    eyeShape: [''],
    eyeColorLeft: [''],
    eyeColorRight: [''],
    hairType: [''],
    topTraits: [''],
    temperament: [''],
    goals: [''],
    fears: [''],
    habits: [''],
    homeRegion: [''],
    occupation: [''],
    education: [''],
    languages: [''],
    backstory: [''],
    skills: [''],
    specialities: [''],
    powers: [''],
    tools: [''],
    weapons: [''],
    weaknesses: [''],
  });

  ngOnInit(): void {
    const project$ = this.store
      .select(fromSelectors.getProjectsStateProjectById(this.projectId))
      .pipe(filter((p): p is ProjectDto => !!p));

    const city$ = this.store
      .select(fromSelectors.getSelectedProjectProperty('characters', this.characterId))
      .pipe(
        filter((w): w is CharacterDto => !!w),
      );

    city$
      .pipe(withLatestFrom(project$), takeUntilDestroyed(this.destroyRef))
      .subscribe(([character, project]) => {
        this.selectedProject = project;
        this.selectedCharacter = character;
        
        this.form.reset({ ...character }, { emitEvent: false });
        this.form.markAsPristine();
        this.form.markAsUntouched();
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
    if (!this.selectedProject || !this.selectedCharacter) return;
    if (this.form.invalid || this.form.pristine) return;

    const updatedCharacter: CharacterDto = {
      ...this.selectedCharacter,
      ...this.form.value,
    };

    const updatedCharacters = (this.selectedProject.characters ?? []).map(w =>
      w.id === updatedCharacter.id ? { ...w, ...updatedCharacter } : w
    );

    this.store.dispatch(fromActions.UpdateProject({
      project: {
        ...this.selectedProject,
        characters: updatedCharacters
      }
    }));

    this.form.markAsPristine();
    this.form.markAsUntouched();
  }
}
