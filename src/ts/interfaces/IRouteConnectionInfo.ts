import { IRouteTrain } from './IRouteTrain';

export interface IRouteConnectionData {
  trackCount: number;
  vMax: number;
  length: number;
}

export interface IRouteConnectionInfo {
  routeName: string;
  sceneryHash?: string;
  sceneryName?: string;

  routeData?: IRouteConnectionData;

  arrivalTrains: IRouteTrain[];
  departureTrains: IRouteTrain[];
}
