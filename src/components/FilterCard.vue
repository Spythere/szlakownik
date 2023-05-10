<template>
  <div @keydown.esc="store.isFilterCardOpen = false">
    <div class="fixed top-0 left-0 w-full h-full z-0" @click="store.isFilterCardOpen = false"></div>
    <div class="absolute top-0 left-0 bg-neutral-900 p-3 z-20">
      <div class="flex justify-between mb-2">
        <p class="text-2xl font-bold text-amber-500">Przefiltruj dane</p>
        <button
          class="bg-green-600 px-3 font-bold text-sm"
          :class="{ 'opacity-50': !store.filters.save }"
          @click="toggleSaveFilters"
        >
          ZAPISUJ FILTRY
        </button>
      </div>

      <div class="flex gap-4 flex-wrap w-full">
        <div>
          <p>Szlaki wolne od:</p>
          <hr class="pb-2" />
          <input type="time" class="text-white p-2 w-full" v-model="store.filters.freeFrom" required />
          <!-- <input type="time" class="text-white p-2" v-model="store.filters.freeTo" required /> -->

          <p class="mt-2">Rezerwa czasowa (minuty):</p>
          <hr class="mb-2" />
          <input type="number" class="p-2 w-full" v-model="store.filters.timeSpan" required />
        </div>

        <div>
          <p>Status minimum od:</p>
          <hr class="pb-2" />

          <div class="flex items-center">
            <span>+</span>
            <input
              type="number"
              min="0"
              max="7"
              class="text-white p-2 mx-1 w-full"
              v-model="store.filters.statusFrom"
              required
            />
            <span>godzin</span>
          </div>

          <p class="mt-2">Uwzględniaj statusy:</p>
          <hr class="mb-2" />
          <div class="flex gap-2 flex-col">
            <button
              class="bg-slate-500"
              :class="{
                'opacity-30': !store.filters.includeOfflineStatus,
                'opacity-100': store.filters.includeOfflineStatus,
              }"
              @click="store.filters.includeOfflineStatus = !store.filters.includeOfflineStatus"
            >
              OFFLINE
            </button>
            <button
              class="bg-slate-500"
              :class="{
                'opacity-30': !store.filters.includeUnsignedStatus,
                'opacity-100': store.filters.includeUnsignedStatus,
              }"
              @click="store.filters.includeUnsignedStatus = !store.filters.includeUnsignedStatus"
            >
              NIEZALOGOWANY
            </button>
            <button
              class="bg-slate-500"
              :class="{
                'opacity-30': !store.filters.includeEndingStatus,
                'opacity-100': store.filters.includeEndingStatus,
              }"
              @click="store.filters.includeEndingStatus = !store.filters.includeEndingStatus"
            >
              KOŃCZY
            </button>
          </div>
        </div>

        <div>
          <p>Szlaki:</p>
          <hr class="mb-2" />

          <div class="flex gap-2">
            <button
              class="bg-slate-500 p-2 w-1/2"
              :class="{
                'opacity-30': !store.filters.include1track,
                'opacity-100': store.filters.include1track,
              }"
              @click="store.filters.include1track = !store.filters.include1track"
            >
              1-torowe
            </button>
            <button
              class="bg-slate-500 p-2 w-1/2"
              :class="{
                'opacity-30': !store.filters.include2track,
                'opacity-100': store.filters.include2track,
              }"
              @click="store.filters.include2track = !store.filters.include2track"
            >
              2-torowe
            </button>
          </div>

          <p class="mt-2">Min. prędkość (km/h):</p>
          <hr class="mb-2" />
          <input type="number" class="p-2 w-full" v-model="store.filters.minimumRouteSpeed" required />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useFilterUtils } from '../stores/filterUtilsStore';
import { useStore } from '../stores/store';

const store = useStore();
const filterUtils = useFilterUtils();

function toggleSaveFilters() {
  store.filters.save = !store.filters.save;

  if (store.filters.save) {
    filterUtils.saveFiltersToStorage();
  }
}
</script>
