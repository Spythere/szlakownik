<script setup lang="ts">
import FilterCard from './components/FilterCard.vue';
import RouteConnectionTable from './components/RouteConnectionTable.vue';
import { useStore } from './stores/store';

import arrowSVG from './assets/arrow.svg';

const store = useStore();
</script>

<template>
  <div class="max-w-screen-2xl mx-auto">
    <div class="p-2 w-full">
      <h1 class="text-center md:text-5xl text-3xl font-semibold">
        Szlakownik<span class="align-top md:text-xl text-base text-amber-500 font-bold">TD2</span>
      </h1>

      <div class="flex gap-3 mt-4 mb-2 flex-wrap">
        <p class="text-2xl font-semibold">Lista zajętości szlaków</p>

        <div class="flex gap-3 flex-wrap">
          <button
            class="bg-slate-700 px-2 py-1 font-bold flex align-middle"
            @click="store.isFilterCardOpen = !store.isFilterCardOpen"
            @keydown.esc="store.isFilterCardOpen = false"
          >
            <img
              class="w-6 align-middle transition-all"
              :class="{ 'rotate-180': store.isFilterCardOpen }"
              :src="arrowSVG"
              alt="arrow"
            />
            {{ store.isFilterCardOpen ? 'ZAMKNIJ' : 'OTWÓRZ' }} FILTRY
          </button>

          <button
            class="bg-slate-700 px-2 py-1 font-bold opacity-50"
            :class="{ 'opacity-100': store.ignoredSceneries.length != 0 }"
            @click="store.ignoredSceneries.length = 0"
          >
            RESETUJ
          </button>
        </div>
      </div>

      <div class="relative">
        <FilterCard v-if="store.isFilterCardOpen" />
      </div>

      <RouteConnectionTable />
    </div>
  </div>
</template>

<style scoped></style>

