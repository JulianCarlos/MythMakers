import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';
import { Project } from '../../models/project';
import { WorldsViewComponent } from '../worlds-view/worlds-view.component';
import { ProjectsStateService } from '../../services/projects-state.service';
import { CitiesViewComponent } from '../cities-view/cities-view.component';
import { CharactersViewComponent } from '../characters-view/characters-view.component';
import { CountriesViewComponent } from '../countries-view/countries-view.component';

type EntityKey = 'worlds' | 'countries' | 'cities' | 'characters';

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
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly state = inject(ProjectsStateService);
  private readonly destroy$ = new Subject<void>();

  form: FormGroup = this.fb.group({});
  protected searchInput = '';

  project$ = combineLatest([
    this.state.projects$,
    this.route.paramMap.pipe(map((p) => p.get('projectId'))),
  ]).pipe(
    map(([projects, id]) => projects.find((p) => p.id === id) ?? null),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  ngOnInit(): void {
    this.form = this.fb.group({
      siteSearch: [''],
    });

    this.form
      .get('siteSearch')!
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        this.searchInput = (value ?? '').toString();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private add(project: Project, key: EntityKey, name: string): void {
    const trimmed = name?.trim();
    if (!trimmed) return;
    this.state.addEntity(project.id, key, { name: trimmed, description: '' });
  }

  private open(
    path: 'world' | 'country' | 'city' | 'character',
    id: string,
  ): void {
    this.router.navigate([path, id], { relativeTo: this.route });
  }

  addWorld(project: Project, name: string): void {
    this.add(project, 'worlds', name);
  }

  addCountry(project: Project, name: string): void {
    this.add(project, 'countries', name);
  }

  addCity(project: Project, name: string): void {
    this.add(project, 'cities', name);
  }

  addCharacter(project: Project, name: string): void {
    this.add(project, 'characters', name);
  }

  openWorld(worldId: string): void {
    this.open('world', worldId);
  }

  openCountry(countryId: string): void {
    this.open('country', countryId);
  }

  openCity(cityId: string): void {
    this.open('city', cityId);
  }

  openCharacter(characterId: string): void {
    this.open('character', characterId);
  }
}
