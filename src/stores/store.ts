import axios from 'axios';
import { defineStore } from 'pinia';
import { IRouteConnectionData, IRouteConnectionInfo } from '../ts/interfaces/IRouteConnectionInfo';
import { IActiveTrain, TrainsAPIResponse } from '../ts/interfaces/IActiveTrain';
import { ISceneryData, SceneriesAPIResponse } from '../ts/interfaces/ISceneryData';
import { IDispatcherOnline } from '../ts/interfaces/IDispatcherOnline';
import { IRouteTrain } from '../ts/interfaces/IRouteTrain';
import { DispatchersAPIResponse } from '../ts/interfaces/IDispatcherOnline';
import { sortConnectionsBy } from '../utils/sortingUtils';

const apiClient = axios.create({
  baseURL: 'https://spythere.pl/api/',
});

function getSceneryName(sceneries: ISceneryData[], hash: string) {
  return sceneries.find((sc) => sc.hash == hash)?.name;
}

function getRouteData(
  sceneries: ISceneryData[],
  routeName: string,
  sceneryHash: string
): IRouteConnectionData | undefined {
  const data = sceneries
    .find((sc) => sc.hash === sceneryHash)
    ?.routes.split(';')
    .find((route) => route.split('_')[0] == routeName);

  if (!data) return undefined;

  const [route, vMax, length] = data.split(':');

  return {
    trackCount: Number(route.split('_')[1][0]) || 0,
    vMax: Number(vMax) || 0,
    length: Number(length) || 0,
  };
}

export const useStore = defineStore('global', {
  state: () => ({
    trains: [] as IActiveTrain[],
    sceneries: [] as ISceneryData[],
    dispatchers: [] as IDispatcherOnline[],

    trafficFactor: 0,

    takenConnectionsNames: [] as string[],
  }),

  getters: {
    freeConnections: (state) => {
      return state.dispatchers.reduce((acc, d) => {
        const sceneryData = state.sceneries.find((s) => s.hash === d.stationHash);
        if (!sceneryData) return acc;

        const sceneryRouteNames = sceneryData.routes.split(';').map((r) => r.split('_')[0]);

        sceneryRouteNames.forEach((routeName) => {
          if (state.takenConnectionsNames.includes(routeName)) return acc;
          if (routeName.includes('!')) return acc;

          const savedInfo = acc.find((info) => info.routeName == routeName && info.sceneryHash == d.stationHash);

          if (!savedInfo) {
            acc.push({
              routeName,
              sceneryHash: d.stationHash,
              arrivalTrains: [],
              departureTrains: [],
              sceneryName: d.stationName,
              routeData: getRouteData(state.sceneries, routeName, d.stationHash),
            });
          }
        });

        return acc;
      }, [] as IRouteConnectionInfo[]);
    },

    takenConnections: (state) => {
      const reducedConns = state.trains.reduce((acc, train) => {
        if (!train.timetable) return acc;

        const routeSceneries = [...train.timetable.sceneries].reverse();
        let currentSceneryIndex = 0;

        train.timetable.stopList.forEach((stop, i) => {
          if (
            stop.arrivalLine !== null &&
            (!stop.confirmed ||
              (stop.confirmed &&
                !train.timetable?.stopList[i + 1]?.confirmed &&
                train.currentStationHash === routeSceneries[currentSceneryIndex])) &&
            !stop.stopped &&
            !/(-|_|sbl|it)/gi.test(stop.arrivalLine)
          ) {
            const savedInfo = acc.find(
              (info) => info.routeName == stop.arrivalLine && info.sceneryHash == routeSceneries[currentSceneryIndex]
            );

            const timetableTrain: IRouteTrain = {
              driverName: train.driverName,
              trainNo: train.trainNo,
              takenRouteAt: stop.arrivalRealTimestamp,
              delay: stop.arrivalDelay,
              confirmedAtLast: stop.confirmed,
            };

            if (savedInfo) savedInfo.arrivalTrains.push(timetableTrain);
            else
              acc.push({
                routeName: stop.arrivalLine,
                sceneryHash: routeSceneries[currentSceneryIndex],
                arrivalTrains: [timetableTrain],
                departureTrains: [],
                sceneryName: getSceneryName(state.sceneries, routeSceneries[currentSceneryIndex] || ''),
                routeData: getRouteData(state.sceneries, stop.arrivalLine, routeSceneries[currentSceneryIndex] || ''),
              });
          }

          if (
            stop.departureLine !== null &&
            (!stop.confirmed ||
              (stop.confirmed &&
                !train.timetable?.stopList[i + 1]?.confirmed &&
                train.currentStationHash === routeSceneries[currentSceneryIndex])) &&
            !stop.stopped &&
            !/(-|_|sbl|it)/gi.test(stop.departureLine)
          ) {
            const savedInfo = acc.find(
              (info) => info.routeName == stop.departureLine && info.sceneryHash == routeSceneries[currentSceneryIndex]
            );

            const timetableTrain: IRouteTrain = {
              driverName: train.driverName,
              trainNo: train.trainNo,
              takenRouteAt: stop.departureRealTimestamp,
              delay: stop.departureDelay,
              confirmedAtLast: stop.confirmed,
            };

            if (savedInfo) savedInfo.departureTrains.push(timetableTrain);
            else
              acc.push({
                routeName: stop.departureLine,
                sceneryHash: routeSceneries[currentSceneryIndex],
                departureTrains: [timetableTrain],
                arrivalTrains: [],
                sceneryName: getSceneryName(state.sceneries, routeSceneries[currentSceneryIndex] || ''),
                routeData: getRouteData(state.sceneries, stop.departureLine, routeSceneries[currentSceneryIndex] || ''),
              });
          }

          if (stop.departureLine !== null && !/(-|_|sbl|it)/gi.test(stop.departureLine)) currentSceneryIndex++;
        });

        return acc;
      }, [] as IRouteConnectionInfo[]);

      sortConnectionsBy('departureTrains', 'asc', reducedConns);
      state.takenConnectionsNames = reducedConns.map((conn) => conn.routeName);

      return reducedConns;
    },
  },

  actions: {
    startFetchingData() {
      this.fetchData();

      setInterval(() => {
        this.fetchData();
        console.log('data fetched');
      }, 25 * 1000);
    },

    async fetchData() {
      try {
        const [trainsResponse, sceneriesResponse, dispatchersResponse] = await Promise.all([
          apiClient.get<TrainsAPIResponse>('getActiveTrainList'),
          apiClient.get<SceneriesAPIResponse>('getSceneries'),
          apiClient.get<DispatchersAPIResponse>('getDispatchers?online=1&countLimit=100'),
        ]);

        this.trains = trainsResponse.data;
        this.sceneries = sceneriesResponse.data;
        this.dispatchers = dispatchersResponse.data;
      } catch (error) {
        console.error(error);
      }
    },
  },
});

