import { ProjectDto } from "@api/models";
import { createFeatureSelector } from "@ngrx/store";

export interface ProjectsState { 
    projects: ProjectDto[]; 
    loading: boolean; 
}

export const initialState: ProjectsState = { 
    projects: [], 
    loading: false 
};

export const getProjectDataState = createFeatureSelector<ProjectsState>('projects');

export const getSectionQueryResultEntities = (state: ProjectsState) => state.projects ?? [];

export const getSectionQueryAllWorlds = (state: ProjectsState) => state.projects.flatMap(p => p.worlds ?? []);
export const getSectionQueryAllCitites = (state: ProjectsState) => state.projects.flatMap(p => p.cities ?? []);
export const getSectionQueryAllCountries = (state: ProjectsState) => state.projects.flatMap(p => p.countries ?? []);
export const getSectionQueryAllCharacters = (state: ProjectsState) => state.projects.flatMap(p => p.characters ?? []);

