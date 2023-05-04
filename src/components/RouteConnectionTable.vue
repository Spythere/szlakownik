<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../stores/store';
import { sortConnectionDates } from '../utils/sortingUtils';

const store = useStore();
store.startFetchingData();

const tableConnections = computed(() => [...store.freeConnections, ...store.takenConnections]);

function getDispatcherStatus(stationHash: string) {
  const statusCode = store.dispatchers.find((d) => d.stationHash == stationHash)?.dispatcherStatus;

  if (statusCode === undefined) return 'OFFLINE';

  switch (statusCode) {
    case -1:
      return 'NIEZALOGOWANY';
    case 0:
      return 'BEZ LIMITU';
    case 1:
      return 'Z/W';
    case 2:
      return 'KOŃCZY';
    case 3:
      return 'BRAK MIEJSCA';
    case 4:
      return 'NIEDOSTĘPNY';

    default:
      return new Date(statusCode).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  }
}
</script>

<template>
  <div class="p-2 w-full">
    <h1 class="text-center text-5xl font-medium">
      Szlakownik<span class="align-top text-xl text-amber-500 font-bold">TD2</span>
    </h1>

    <div class="flex gap-4">
      <section class="overflow-hidden">
        <div class="text-2xl mb-2 mt-4">Lista zajętości szlaków</div>

        <div class="overflow-auto">
          <table class="table-fixed border-collapse" style="width: 100%">
            <thead>
              <tr>
                <th class="border border-slate-600 p-2 bg-slate-900 w-20">Szlak</th>
                <th class="border border-slate-600 p-2 bg-slate-900 w-44">Sceneria</th>
                <th class="border border-slate-600 p-2 bg-slate-900 w-44">Status</th>
                <th class="border border-slate-600 p-2 bg-slate-900 w-24">
                  Liczba <br /> 
                  połączeń
                </th>
                <th class="border border-slate-600 p-2 bg-slate-900 w-96">Przyjazdy na szlak</th>
                <th class="border border-slate-600 p-2 bg-slate-900 w-96">Odjazdy na szlak</th>
                <th class="border border-slate-600 p-2 bg-slate-900 w-52">Informacje o szlaku</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(connInfo, i) in tableConnections">
                <!-- Szlak -->
                <td class="border border-slate-600 p-2 bg-slate-800 text-center">{{ connInfo.routeName }}</td>

                <!-- Sceneria -->
                <td class="border border-slate-600 p-2 bg-slate-800">
                  {{ connInfo.sceneryName || '---' }}
                </td>

                <!-- Status -->
                <td class="border border-slate-600 p-2 bg-slate-800">
                  {{ getDispatcherStatus(connInfo.sceneryHash || '') }}
                </td>

                <!-- Liczba poł. -->
                <td class="border border-slate-600 p-2 bg-slate-800 text-center">
                  {{ connInfo.departureTrains.length + connInfo.arrivalTrains.length }}
                </td>

                <!-- Przyjazdy -->
                <td class="border border-slate-600 p-2 bg-slate-800" v-if="(connInfo.routeData?.trackCount || 0) > 1">
                  <b v-if="connInfo.arrivalTrains.length > 0">[{{ connInfo.arrivalTrains.length }}]</b>
                  <span class="text-green-400" v-else>Brak zaplanowanych przyjazdów</span>
                  {{ sortConnectionDates(connInfo.arrivalTrains).join(', ') }}
                </td>

                <!-- Odjazdy -->
                <td class="border border-slate-600 p-2 bg-slate-800" v-if="(connInfo.routeData?.trackCount || 0) > 1">
                  <b v-if="connInfo.departureTrains.length > 0">[{{ connInfo.departureTrains.length }}]</b>
                  <span class="text-green-400" v-else>Brak zaplanowanych odjazdów</span>
                  {{ sortConnectionDates(connInfo.departureTrains).join(', ') }}
                </td>

                <!-- Przyjazdy/Odjazdy -->
                <td class="border border-slate-600 p-2 bg-slate-800" colspan="2" v-else>
                  <b v-if="connInfo.departureTrains.length + connInfo.arrivalTrains.length > 0">
                    [{{ connInfo.departureTrains.length + connInfo.arrivalTrains.length }}]
                  </b>
                  <span class="text-green-400" v-else>Brak zaplanowanych przyjazdów i odjazdów</span>
                  {{ sortConnectionDates([...connInfo.departureTrains, ...connInfo.arrivalTrains]).join(', ') }}
                </td>

                <!-- Informacje -->
                <td class="border border-slate-600 p-2 bg-slate-800 text-center">
                  {{
                    connInfo.routeData
                      ? `${connInfo.routeData.trackCount}-tor • ${connInfo.routeData.vMax}km/h • ${connInfo.routeData.length}m`
                      : 'brak informacji'
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>
</template>

