import { City } from './city';

export interface World {
  id: string;
  name?: string;
  description?: string;
  cities?: City[];
  projectId: string;
  createdAt: Date;
}
