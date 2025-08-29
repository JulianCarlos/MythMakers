import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnDestroy, OnInit } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Subject } from 'rxjs';
import { distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { ProjectDto } from '../../api/models/project-dto';
import { CharactersViewComponent } from '../characters-view/characters-view.component';
import { CitiesViewComponent } from '../cities-view/cities-view.component';
import { CountriesViewComponent } from '../countries-view/countries-view.component';
import { WorldsViewComponent } from '../worlds-view/worlds-view.component';

import * as fromActions from 'store/actions/project.action';
import * as fromSelectors from 'store/selectors/project.selector';
import { ProjectAttributeType } from 'app/enums/project-attribute-type';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AsyncPipe,
    WorldsViewComponent,
    CitiesViewComponent,
    CharactersViewComponent,
    CountriesViewComponent,
  ],
  templateUrl: './project-details.component.html',
  styleUrls: ['./project-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetailsComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(Store);

  protected form: FormGroup = this.fb.group({ siteSearch: [''] });
  protected searchQuery = '';

  projectId = input.required<number>();

  readonly project$ = combineLatest([
    toObservable(this.projectId).pipe(
      map(value => Number(value)),
      distinctUntilChanged()
    ),
    this.store.select(fromSelectors.getProjectsStateProjects),
  ]).pipe(
    map(([id, projects]) =>
      projects.find(p => p.id === id) ?? null
    )
  );

  ngOnInit(): void {
    this.form.get('siteSearch')!
      .valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(value => {
        this.searchQuery = (value ?? '').toString();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected open(path: 'world' | 'country' | 'city' | 'character', id: number): void {
    this.router.navigate([path, id], { relativeTo: this.route });
  }

  protected add(project: ProjectDto, key: ProjectAttributeType, name: string): void {
    const newName = (name ?? '').trim();

    if (!newName) {
      return;
    }

    const updated: ProjectDto = {
      ...project,
      [key]: [...(project[key] ?? []), { id: 0, name: newName, projectId: project.id }],
    };

    this.store.dispatch(fromActions.UpdateProject({ project: updated }));
  }

  protected remove(project: ProjectDto, key: ProjectAttributeType, id: number): void {
    const updated: ProjectDto = { 
      ...project, 
      [key]: (project[key] ?? []).filter((e: any) => e?.id !== id),
    };

    this.store.dispatch(fromActions.UpdateProject({ project: updated }));
  }
}
