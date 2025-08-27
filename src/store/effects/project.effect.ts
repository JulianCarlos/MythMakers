import { Injectable, inject } from '@angular/core';
import { ProjectsService } from '@api/services';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { EMPTY } from 'rxjs';
import { map, exhaustMap, catchError, switchMap } from 'rxjs/operators';

import * as fromActions from 'store/actions/project.action';

@Injectable()
export class ProjectEffects {
  private actions$ = inject(Actions);
  private projectService = inject(ProjectsService);

  loadProjects$ = createEffect(() => {
    return this.actions$.pipe(
        ofType(fromActions.LoadAllProjects),
        switchMap(() => this.projectService.apiProjectsGet()
          .pipe(
            map(projects => fromActions.LoadAllProjectsSuccessful({ projects })),
            catchError(() => EMPTY)
          ))
    );
  });
}