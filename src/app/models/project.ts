import { Character } from './character';
import { City } from './city';
import { Country } from './country';
import { World } from './world';

export interface Project {
  id: string;
  name: string;
  worlds?: World[];
  countries?: Country[];
  cities?: City[];
  characters?: Character[];
}
