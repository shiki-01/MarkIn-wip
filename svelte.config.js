import { preprocessMeltUI, sequence } from '@melt-ui/pp';
import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';
/** @type {import('@sveltejs/kit').Config}*/
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: sequence([preprocess(), preprocessMeltUI()]),
	kit: {
		adapter: adapter({
			fallback: 'index.html',
		}),
		prerender: {
			entries: [],
		},
	},
};
export default config;
