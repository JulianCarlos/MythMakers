import { Character } from "./character";
import { City } from "./city";
import { World } from "./world";

export interface Project {
    id: string;
    name: string;
    worlds?: World[];
    cities?: City[];
    characters?: Character[];
}
