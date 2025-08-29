import { createSelector } from "@ngrx/store";
import { ProjectAttributeType } from "app/enums/project-attribute-type";

import * as fromState from 'store/states/project.state';

export const getProjectsState = createSelector(
    fromState.getProjectDataState,
    (state: fromState.ProjectsState) => state
);

export const getProjectsStateProjects = createSelector(
  getProjectsState,
  fromState.getSectionQueryResultEntities
);

export const getSelectedProjectProperty = (key: ProjectAttributeType, id: number | string) =>
  createSelector(getProjectsStateProjects, (projects) => {
    const list = (projects ?? []).flatMap((p: any) => p?.[key] ?? []);
    const target = Number(id);
    return list.find((item: any) => Number(item?.id) === target) ?? null;
  }
);