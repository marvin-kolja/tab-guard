import {defineConfig} from 'vite'
import copy from 'rollup-plugin-copy'

export default defineConfig(({mode}) => {
	return {
		build: {
			minify: false,
			outDir: 'dist',
			rollupOptions: {
				input: {
					'content-script': './source/content-script.ts',
				},
				output: {
					entryFileNames: '[name].js',
				},
				plugins: [
					copy({
						targets: [
							{src: './source/manifest.json', dest: 'dist'},
						],
						hook: 'writeBundle',
						verbose: true,
					}),
				],
			},
		},
		esbuild: {
			pure:
				mode === 'production'
					? ['console.log', 'console.debug', 'console.trace']
					: [],
		},
	}
})
