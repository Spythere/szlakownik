import { IRouteConnectionInfo } from '../ts/interfaces/IRouteConnectionInfo';
import { IRouteTrain } from '../ts/interfaces/IRouteTrain';
import { TSorterDirection, TSorterType } from '../ts/types/TSorter';

export function sortConnectionsBy(sorter: TSorterType, dir: TSorterDirection, connections: IRouteConnectionInfo[]) {
  return connections.sort((conn1, conn2) => {
    switch (sorter) {
      case 'departureTrains':
        return (
          (dir == 'asc' ? conn1 : conn2).departureTrains.length +
          (dir == 'asc' ? conn1 : conn2).arrivalTrains.length -
          ((dir == 'asc' ? conn2 : conn1).departureTrains.length + (dir == 'asc' ? conn2 : conn1).arrivalTrains.length)
        );

      default:
        return 1;
    }
  });
}

export function sortConnectionDates(trains: IRouteTrain[]) {
  return trains
    .sort((a, b) => a.takenRouteAt - b.takenRouteAt)
    .map(
      (t) =>
        `${new Date(t.takenRouteAt).toLocaleTimeString('pl-PL', {
          hour: '2-digit',
          minute: '2-digit',
        })}${t.delay ? ` (${Math.sign(t.delay) >= 0 ? '+' : ''}${t.delay})` : ''}`
    );
}
