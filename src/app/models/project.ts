import { World } from "./world";

export interface Project {
    id: string;
    name: string;
    worlds?: World[];
}
