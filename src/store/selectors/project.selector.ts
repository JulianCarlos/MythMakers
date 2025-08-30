import { ProjectDto } from "@api/models";
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

export const getProjectsStateProjectById = (id: number | string) =>
  createSelector(getProjectsStateProjects, (projects) => {
    const target = Number(id);
    return (projects ?? []).find((p: ProjectDto) => Number(p.id) === target) ?? null;
  }
);

export const getSelectedProjectProperty = (key: keyof ProjectDto, id: number | string) =>
  createSelector(getProjectsStateProjects, (projects) => {
    const list = (projects ?? []).flatMap((p: any) => p?.[key] ?? []);
    const target = Number(id);
    return list.find((item: any) => Number(item?.id) === target) ?? null;
  }
);