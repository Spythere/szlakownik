<script setup lang="ts">
import { computed } from 'vue';
import { useStore } from '../stores/store';
import { sortConnectionDates } from '../utils/sortingUtils';

const store = useStore();
store.startFetchingData();

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

function toggleIgnoredScenery(sceneryName?: string) {
  if (!sceneryName) return;

  const index = store.ignoredSceneries.indexOf(sceneryName);
  if (index == -1) store.ignoredSceneries.push(sceneryName);
  else store.ignoredSceneries.splice(index, 1);
}
</script>

<template>
  <div class="flex gap-4">
    <section class="overflow-hidden">
      <div class="overflow-auto">
        <table class="table-fixed border-collapse" style="width: 100%">
          <thead>
            <tr class="bg-slate-900">
              <th class="border border-slate-600 p-2 w-20">Szlak</th>
              <th class="border border-slate-600 p-2 w-44">Sceneria</th>
              <th class="border border-slate-600 p-2 w-44">Status</th>
              <th class="border border-slate-600 p-2 w-24">
                Liczba <br />
                połączeń
              </th>
              <th class="border border-slate-600 p-2 w-96">Przyjazdy na szlak</th>
              <th class="border border-slate-600 p-2 w-96">Odjazdy na szlak</th>
              <th class="border border-slate-600 p-2 w-52">Informacje o szlaku</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(connInfo, i) in store.filteredConnections"
              :class="{ 'opacity-50': store.ignoredSceneries.includes(connInfo.sceneryName || '') }"
              class="bg-slate-800"
              @click="toggleIgnoredScenery(connInfo.sceneryName)"
            >
              <!-- Szlak -->
              <td class="border border-slate-600 p-2 text-center">{{ connInfo.routeName }}</td>

              <!-- Sceneria -->
              <td class="border border-slate-600 p-2">
                {{ connInfo.sceneryName || '---' }}
              </td>

              <!-- Status -->
              <td class="border border-slate-600 p-2">
                {{ getDispatcherStatus(connInfo.sceneryHash || '') }}
              </td>

              <!-- Liczba poł. -->
              <td class="border border-slate-600 p-2 text-center">
                {{ connInfo.departureTrains.length + connInfo.arrivalTrains.length }}
              </td>

              <!-- Przyjazdy -->
              <td class="border border-slate-600 p-2" v-if="(connInfo.routeData?.trackCount || 0) > 1">
                <b v-if="connInfo.arrivalTrains.length > 0">[{{ connInfo.arrivalTrains.length }}]</b>
                <span class="text-green-400" v-else>Brak zaplanowanych przyjazdów</span>
                {{ sortConnectionDates(connInfo.arrivalTrains).join(', ') }}
              </td>

              <!-- Odjazdy -->
              <td class="border border-slate-600 p-2" v-if="(connInfo.routeData?.trackCount || 0) > 1">
                <b v-if="connInfo.departureTrains.length > 0">[{{ connInfo.departureTrains.length }}]</b>
                <span class="text-green-400" v-else>Brak zaplanowanych odjazdów</span>
                {{ sortConnectionDates(connInfo.departureTrains).join(', ') }}
              </td>

              <!-- Przyjazdy/Odjazdy -->
              <td class="border border-slate-600 p-2" colspan="2" v-else>
                <b v-if="connInfo.departureTrains.length + connInfo.arrivalTrains.length > 0">
                  [{{ connInfo.departureTrains.length + connInfo.arrivalTrains.length }}]
                </b>
                <span class="text-green-400" v-else>Brak zaplanowanych przyjazdów i odjazdów</span>
                {{ sortConnectionDates([...connInfo.departureTrains, ...connInfo.arrivalTrains]).join(', ') }}
              </td>

              <!-- Informacje -->
              <td class="border border-slate-600 p-2 text-center">
                {{
                  connInfo.routeData
                    ? `${connInfo.routeData.trackCount}-tor • ${connInfo.routeData.vMax}km/h • ${connInfo.routeData.length}m`
                    : 'brak informacji'
                }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="w-100 border border-slate-600 p-2 bg-slate-900 mt-2 text-xl text-center" v-if="store.dataLoading">
          Ładowanie danych...
        </div>
      </div>
    </section>
  </div>
</template>

