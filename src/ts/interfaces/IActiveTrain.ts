export interface ITrainTimetable {
  timetableId: number;
  category: string;
  route: string;

  stopList: ITimetableStop[];

  TWR: boolean;
  SKR: boolean;
  sceneries: string[];
}

export interface ITimetableStop {
  stopName: string;
  stopNameRAW: string;
  stopType: string;
  stopDistance: number;
  pointId: number;

  mainStop: boolean;

  arrivalLine: string;
  arrivalTimestamp: number;
  arrivalRealTimestamp: number;
  arrivalDelay: number;

  departureLine: string;
  departureTimestamp: number;
  departureRealTimestamp: number;
  departureDelay: number;

  comments?: any;

  beginsHere: boolean;
  terminatesHere: boolean;
  confirmed: boolean;
  stopped: boolean;
  stopTime: number;
}

export interface IActiveTrain {
  trainNo: number;

  mass: number;
  length: number;
  speed: number;
  stockString: string;

  signal: string;
  distance: number;
  connectedTrack: string;

  driverName: string;
  driverId: number;
  driverIsSupporter: boolean;
  driverLevel?: number;

  currentStationName: string;
  currentStationHash: string;

  online: boolean;
  lastSeen: number;

  region: string;
  isTimeout: boolean;

  timetable?: ITrainTimetable;
}

export type TrainsAPIResponse = IActiveTrain[];