import axios from 'axios';
import { defineStore } from 'pinia';
import { ISceneryAPI, ITrainAPI } from '../interfaces/api.interfaces';

const apiClient = axios.create({
  baseURL: 'https://spythere.pl/api/',
});

interface IRouteConnectionInfo {
  routeName: string;
  sceneryHash?: string;
  routeTrains: ITrainAPI[];
  arrival: boolean;
}

export const useStore = defineStore('global', {
  state: () => ({
    trains: [] as ITrainAPI[],
    sceneries: [] as ISceneryAPI[],
  }),

  getters: {
    takenConnections(state) {
      return state.trains
        .reduce((acc, train) => {
          if (!train.timetable) return acc;

          const sceneries = [...train.timetable.sceneries].reverse();
          let currentSceneryIndex = 0;

          train.timetable.stopList.forEach((stop) => {
            if (stop.arrivalLine !== null && !stop.confirmed && !stop.stopped) {
              const savedInfo = acc.find(
                (info) => info.routeName == stop.arrivalLine && info.sceneryHash == sceneries[currentSceneryIndex]
              );

              if (savedInfo) savedInfo.routeTrains.push(train);
              else
                acc.push({
                  routeName: stop.arrivalLine,
                  sceneryHash: sceneries[currentSceneryIndex],
                  arrival: true,
                  routeTrains: [train],
                });
            }

            if (stop.departureLine !== null && !/(-|_|sbl|it)/gi.test(stop.departureLine)) {
              currentSceneryIndex++;
            }
          });

          return acc;
        }, [] as IRouteConnectionInfo[])
        .sort((a, b) => b.routeTrains.length - a.routeTrains.length)
        .map((conn) => ({
          ...conn,
          routeTrains: conn.routeTrains.sort(
            (t1, t2) =>
              t1.timetable!.stopList.find((stop) => stop.arrivalLine == conn.routeName)!.arrivalRealTimestamp -
              t2.timetable!.stopList.find((stop) => stop.arrivalLine == conn.routeName)!.arrivalRealTimestamp
          ),
        }));
    },
  },

  actions: {
    async fetchData() {
      try {
        const trains = (await apiClient.get<ITrainAPI[]>('getActiveTrainList')).data;
        const sceneries = (await apiClient.get<ISceneryAPI[]>('getSceneries')).data;

        this.trains = trains;
        this.sceneries = sceneries;
      } catch (error) {
        console.error(error);
      }
    },
  },
});

