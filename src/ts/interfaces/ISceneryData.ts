import { TAvailability } from "../types/TAvailability";

export interface ISceneryData {
  id: string;
  hash: string;
  name: string;
  url: string;
  lines: string;
  project: string | null;
  projectUrl: string | null;
  reqLevel: number;
  signalType: string;
  controlType: string;
  SUP: boolean;
  routes: string;
  checkpoints: string;
  authors: string;
  availability: TAvailability;
}

export type SceneriesAPIResponse = ISceneryData[];

