import axios from 'axios';
import { defineStore } from 'pinia';
import { IRouteConnectionInfo } from '../ts/interfaces/IRouteConnectionInfo';
import { IActiveTrain, TrainsAPIResponse } from '../ts/interfaces/IActiveTrain';
import { ISceneryData, SceneriesAPIResponse } from '../ts/interfaces/ISceneryData';
import { IDispatcherOnline } from '../ts/interfaces/IDispatcherOnline';
import { IRouteTrain } from '../ts/interfaces/IRouteTrain';
import { DispatchersAPIResponse } from '../ts/interfaces/IDispatcherOnline';
import { sortConnectionsBy } from '../utils/sortingUtils';
import { getRouteData, getSceneryName } from '../utils/dataUtils';

const apiClient = axios.create({
  baseURL: 'https://spythere.pl/api/',
});

export const useStore = defineStore('global', {
  state: () => ({
    trains: [] as IActiveTrain[],
    sceneries: [] as ISceneryData[],
    dispatchers: [] as IDispatcherOnline[],

    availableConnections: [] as IRouteConnectionInfo[],

    dataLoading: false,
    trafficFactor: 0,

    isFilterCardOpen: false,

    filters: {
      freeFrom: '',
      freeTo: '',
      timeSpan: 5,
      statusFrom: 0,
      include1track: true,
      include2track: true,
      minimumRouteSpeed: 0,
      includeOfflineStatus: true,
      includeUnsignedStatus: true,
      includeEndingStatus: true,
      save: true
    },

    takenConnectionsNames: [] as string[],
    ignoredSceneries: [] as string[],
  }),

  getters: {
    filteredConnections(state) {
      return state.availableConnections.filter((conn) => {
        if (!state.filters.include1track && conn.routeData?.trackCount == 1) return false;
        if (!state.filters.include2track && conn.routeData?.trackCount == 2) return false;

        const status = state.dispatchers.find((d) => d.stationHash == conn.sceneryHash)?.dispatcherStatus;

        if (!state.filters.includeEndingStatus && status == 2) return false;
        if (!state.filters.includeOfflineStatus && status === undefined) return false;
        if (!state.filters.includeUnsignedStatus && status == -1) return false;

        if((conn.routeData?.vMax || 0) < state.filters.minimumRouteSpeed) return false;

        const statusFromDate = new Date().setUTCHours(new Date().getUTCHours() + state.filters.statusFrom);

        if (status !== undefined && status > 4 && statusFromDate - status > 0) return false;

        if (state.filters.freeFrom) {
          const freeFrom = new Date().setHours(
            Number(state.filters.freeFrom.split(':')[0]),
            Number(state.filters.freeFrom.split(':')[1])
          );

          const areArrivalsFree = conn.arrivalTrains.every((t) => {
            if (t.takenRouteAt - state.filters.timeSpan * 60000 < freeFrom) return false;

            return true;
          });

          const areDeparturesFree = conn.departureTrains.every((t) => {
            if (t.takenRouteAt - state.filters.timeSpan * 60000 < freeFrom) return false;

            return true;
          });

          return conn.routeData?.trackCount == 1
            ? areArrivalsFree && areDeparturesFree
            : areArrivalsFree || areDeparturesFree;
        }

        return true;
      });
    },
  },

  actions: {
    async startFetchingData() {
      this.dataLoading = true;
      const sceneriesResponse = await apiClient.get<SceneriesAPIResponse>('getSceneries');
      this.sceneries = sceneriesResponse.data;

      this.fetchData();

      setInterval(() => {
        this.fetchData();
      }, 25 * 1000);
    },

    async fetchData() {
      try {
        const [trainsResponse, dispatchersResponse] = await Promise.all([
          apiClient.get<TrainsAPIResponse>('getActiveTrainList'),
          apiClient.get<DispatchersAPIResponse>('getDispatchers?online=1&countLimit=100'),
        ]);

        this.trains = trainsResponse.data;
        this.dispatchers = dispatchersResponse.data;

        this.getAvailableConnections();
      } catch (error) {
        console.error(error);
      }

      this.dataLoading = false;
    },

    getAvailableConnections() {
      const takenConnections = this.trains.reduce((acc, train) => {
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
                sceneryName: getSceneryName(this.sceneries, routeSceneries[currentSceneryIndex] || ''),
                routeData: getRouteData(this.sceneries, stop.arrivalLine, routeSceneries[currentSceneryIndex] || ''),
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
                sceneryName: getSceneryName(this.sceneries, routeSceneries[currentSceneryIndex] || ''),
                routeData: getRouteData(this.sceneries, stop.departureLine, routeSceneries[currentSceneryIndex] || ''),
              });
          }

          if (stop.departureLine !== null && !/(-|_|sbl|it)/gi.test(stop.departureLine)) currentSceneryIndex++;
        });

        return acc;
      }, [] as IRouteConnectionInfo[]);

      const freeConnections = this.dispatchers.reduce((acc, d) => {
        const sceneryData = this.sceneries.find((s) => s.hash === d.stationHash);
        if (!sceneryData) return acc;

        const sceneryRouteNames = sceneryData.routes.split(';').map((r) => r.split('_')[0]);

        sceneryRouteNames.forEach((routeName) => {
          if (takenConnections.find((conn) => conn.routeName === routeName)) return acc;
          if (routeName.includes('!')) return acc;

          const savedInfo = acc.find((info) => info.routeName == routeName && info.sceneryHash == d.stationHash);

          if (!savedInfo) {
            acc.push({
              routeName,
              sceneryHash: d.stationHash,
              arrivalTrains: [],
              departureTrains: [],
              sceneryName: d.stationName,
              routeData: getRouteData(this.sceneries, routeName, d.stationHash),
            });
          }
        });

        return acc;
      }, [] as IRouteConnectionInfo[]);

      this.availableConnections = [...takenConnections, ...freeConnections];
      sortConnectionsBy('departureTrains', 'asc', this.availableConnections);
    },
  },
});

