// Customized HMR-safe stores
// Based off https://github.com/svitejs/svite/blob/ddec6b9/packages/playground/hmr/src/stores/hmr-stores.js
import { writable, type Writable } from 'svelte/store';

/**
 * @type { Record<string, import('svelte/store').Writable<any>> }
 */
let stores: { [key: string]: Writable<number> } = {};

/**
 * @template T
 * @param { string } id
 * @param { T } initialValue
 * @returns { import('svelte/store').Writable<T> }
 */
export function getStore(id: string, initialValue: number) {
	return stores[id] || (stores[id] = writable(initialValue));
}

// preserve the store across HMR updates
if (import.meta.hot) {
	if (import.meta.hot.data.stores) {
		stores = import.meta.hot.data.stores;
	}
	import.meta.hot.accept();
	import.meta.hot.dispose(() => {
		import.meta.hot.data.stores = stores;
	});
}
