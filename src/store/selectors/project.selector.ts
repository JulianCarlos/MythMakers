import { createSelector } from "@ngrx/store";

import * as fromState from 'store/states/project.state';

export const getProjectsState = createSelector(
    fromState.getProjectDataState,
    (state: fromState.ProjectsState) => state
);

export const getProjectsStateProjects = createSelector(
  getProjectsState,
  fromState.getSectionQueryResultEntities
);
