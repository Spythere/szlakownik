export interface IRouteTrain {
  trainNo: number;
  driverName: string;

  takenRouteAt: number;
  confirmedAtLast: boolean;
  delay: number;
}