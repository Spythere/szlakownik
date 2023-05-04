export type DispatchersAPIResponse = IDispatcherOnline[];

export interface IDispatcherOnline {
  createdAt: string;
  updatedAt: string;
  id: number;
  currentDuration: number;
  dispatcherId: number;
  dispatcherName: string;
  dispatcherStatus: number;
  dispatcherLevel: number;
  dispatcherIsSupporter: boolean;
  dispatcherRate: number;
  isOnline: boolean;
  lastOnlineTimestamp: number;
  region: string;
  stationHash: string;
  stationName: string;
  timestampFrom: number;
  timestampTo: any;
}
