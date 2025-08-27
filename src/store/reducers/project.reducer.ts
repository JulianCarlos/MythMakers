import { Action, createReducer, on } from '@ngrx/store';
import { ProjectsState } from 'store/states/project.state';

import * as fromActions from 'store/actions/project.action';
import * as fromState from 'store/states/project.state';

export const projectsReducer = createReducer(
  fromState.initialState,
  on(fromActions.LoadAllProjects, (state) => ({ 
    ...state, 
    loading: true 
  })),
  on(fromActions.LoadAllProjectsSuccessful, (state, { projects }) => ({ 
    ...state, 
    loading: false, 
    projects 
  }))
);

export function reducer(
  state: ProjectsState | undefined,
  action: Action
): ProjectsState {
  return projectsReducer(state, action);
}
