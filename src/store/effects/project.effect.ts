import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ProjectsService } from '@api/services';
import { EMPTY } from 'rxjs';
import { map, catchError, exhaustMap, concatMap } from 'rxjs/operators';
import * as fromActions from 'store/actions/project.action';

@Injectable()
export class ProjectEffects {
  private readonly actions$ = inject(Actions);
  private readonly projectService = inject(ProjectsService);

  // Load
  readonly loadProjects$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.LoadAllProjects),
      exhaustMap(() =>
        this.projectService.apiProjectsGet().pipe(
          map(projects => fromActions.LoadAllProjectsSuccessful({ projects })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  // Create/Update
  readonly createProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.CreateProject),
      concatMap(({ project }) =>
        this.projectService.apiProjectsPost({ body: project }).pipe(
          map(saved => fromActions.CreateProjectSuccessful({ project: saved })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  // Update
  readonly updateProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.UpdateProject),
      concatMap(({ project }) =>
        this.projectService.apiProjectsPut({ body: project }).pipe(
          map(saved => fromActions.UpdateProjectSuccessful({ project: saved })),
          catchError(() => EMPTY)
        )
      )
    )
  );

  // Delete
  readonly deleteProjectById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fromActions.DeleteProjectById),
      concatMap(({ projectId }) =>
        this.projectService.apiProjectsIdDelete({ id: projectId }).pipe(
          map(() => fromActions.DeleteProjectByIdSuccess({ projectId })),
          catchError(() => EMPTY)
        )
      )
    )
  );
}
