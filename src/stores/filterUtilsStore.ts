import { defineStore } from 'pinia';
import { useStore } from './store';

export const useFilterUtils = defineStore('filters', () => {
  const store = useStore();

  function saveFiltersToStorage() {
    type FilterKey = keyof typeof store.filters;

    Object.keys(store.filters).forEach((filterKey: string) => {
      window.localStorage.setItem(filterKey, store.filters[filterKey as FilterKey].toString());
    });
  }

  return {
    saveFiltersToStorage,
  };
});
