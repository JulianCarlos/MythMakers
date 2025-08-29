import { createSelector } from "@ngrx/store";
import e from "express";

import * as fromState from 'store/states/project.state';

export const getProjectsState = createSelector(
    fromState.getProjectDataState,
    (state: fromState.ProjectsState) => state
);

export const getProjectsStateProjects = createSelector(
  getProjectsState,
  fromState.getSectionQueryResultEntities
);

export const getSelectedWorld = (worldId: number) => createSelector(
  getProjectsStateProjects,
  (projects) => {
    const target = Number(worldId);
    const worlds = projects?.flatMap(p => p.worlds ?? []) ?? [];
    return worlds.find(w => Number(w.id) === target) ?? null;
  }
);
