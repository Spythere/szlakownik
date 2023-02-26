<script setup lang="ts">
import { useStore } from '../stores/store';

const store = useStore();

store.fetchData();

function getSceneryName(hash: string) {
  return store.sceneries.find((sc) => sc.hash == hash)?.name;
}
</script>

<template>
  <div class="container p-2">
    <h1 class="text-center text-5xl font-medium">
      Szlakownik<span class="align-top text-xl text-amber-500 font-bold">TD2</span>
    </h1>

    <div class="text-2xl mb-2 mt-4">Lista zajętych szlaków</div>

    <table class="table-fixed border-collapse">
      <thead>
        <tr>
          <th class="border border-slate-600 p-2 bg-slate-900">Nazwa szlaku</th>
          <th class="border border-slate-600 p-2 bg-slate-900">Sceneria</th>
          <th class="border border-slate-600 p-2 bg-slate-900">Pociągi (przyjazd)</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="connInfo in store.takenConnections">
          <td class="border border-slate-600 p-2 bg-slate-800">{{ connInfo.routeName }}</td>
          <td class="border border-slate-600 p-2 bg-slate-800">
            {{ connInfo.sceneryHash ? getSceneryName(connInfo.sceneryHash) : '---' }}
          </td>
          <td class="border border-slate-600 p-2 bg-slate-800">
            {{ connInfo.routeTrains.length }} - {{ connInfo.routeTrains.map((t) => t.trainNo).join(', ') }}
          </td>
          <!-- <td class="border border-slate-600 p-2 bg-slate-800">Czermin</td>
          <td class="border border-slate-600 p-2 bg-slate-800"><b class="text-amber-500">1101</b>: 20:21-20:23</td>
          <td class="border border-slate-600 p-2 bg-slate-800">22020, 1101, 20211</td> -->
        </tr>
      </tbody>
    </table>
  </div>
</template>

