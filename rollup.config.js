import typescript from '@rollup/plugin-typescript';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import svelte from "rollup-plugin-svelte";
import autoPreprocess from 'svelte-preprocess';

const TEST_VAULT = 'test-vault/.obsidian/plugins/writing-goals';

export default {
  input: 'src/main.ts',
  output: {
    dir: './',
    sourcemap: 'inline',
    format: 'cjs',
    exports: 'default'
  },
  external: ['obsidian'],
  plugins: [
    svelte({
      emitCss: false,
       preprocess: autoPreprocess()
    }),
    nodeResolve({browser: true}),
    commonjs(),
    typescript(),
    copy({
      targets: [
        { src: 'main.js', dest: TEST_VAULT },
        { src: ['manifest.json', 'styles.css'], dest: TEST_VAULT }
      ], flatten: true
    })
  ]
};