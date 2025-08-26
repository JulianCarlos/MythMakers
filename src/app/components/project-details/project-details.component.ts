import { ChangeDetectionStrategy, Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, Subject, merge } from 'rxjs';
import { map, takeUntil, switchMap, shareReplay, startWith } from 'rxjs/operators';
import { ProjectDto } from '../../api/models/project-dto';
import { WorldsViewComponent } from '../worlds-view/worlds-view.component';
import { CitiesViewComponent } from '../cities-view/cities-view.component';
import { CharactersViewComponent } from '../characters-view/characters-view.component';
import { CountriesViewComponent } from '../countries-view/countries-view.component';
import { ProjectsService } from '../../api/services/projects.service';

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
  private readonly projectsService = inject(ProjectsService);
  private readonly destroy$ = new Subject<void>();
  private readonly refresh$ = new Subject<void>();

  form: FormGroup = this.fb.group({});
  protected searchInput = '';

  project$ = combineLatest([
    this.route.paramMap.pipe(map(p => Number(p.get('projectId')))),
    merge(this.refresh$.pipe(startWith(void 0)), this.route.queryParamMap.pipe(map(() => void 0))),
  ]).pipe(
    map(([id]) => id),
    switchMap(id => this.projectsService.apiProjectsIdGet({ id })),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  ngOnInit(): void {
    this.form = this.fb.group({ siteSearch: [''] });
    this.form.get('siteSearch')!.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.searchInput = (value ?? '').toString();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private add(project: ProjectDto, key: EntityKey, name: string): void {
    const trimmed = name?.trim();
    if (!trimmed) return;
    const updatedProject: ProjectDto = { ...project };
    const arr = Array.isArray(updatedProject[key]) ? (updatedProject[key] as any[]) : [];
    const newEntity = { id: 0, name: trimmed };
    (updatedProject as any)[key] = [...arr, newEntity];
    this.projectsService.apiProjectsPost({ body: updatedProject }).subscribe(() => {
      this.refresh$.next();
    });
  }

  private open(path: 'world' | 'country' | 'city' | 'character', id: number): void {
    this.router.navigate([path, id], { relativeTo: this.route });
  }

  addWorld(project: ProjectDto, name: string): void {
    this.add(project, 'worlds', name);
  }

  addCountry(project: ProjectDto, name: string): void {
    this.add(project, 'countries', name);
  }

  addCity(project: ProjectDto, name: string): void {
    this.add(project, 'cities', name);
  }

  addCharacter(project: ProjectDto, name: string): void {
    this.add(project, 'characters', name);
  }

  openWorld(worldId: number): void {
    this.open('world', worldId);
  }

  openCountry(countryId: number): void {
    this.open('country', countryId);
  }

  openCity(cityId: number): void {
    this.open('city', cityId);
  }

  openCharacter(characterId: number): void {
    this.open('character', characterId);
  }
}
