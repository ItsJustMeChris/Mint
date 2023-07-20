import includePaths from 'rollup-plugin-includepaths';

export default {
    input: './index.mjs',
    output: {
        file: './build/mint.mjs',
        format: 'esm',
        name: 'bundle'
    },
    plugins: [
        includePaths({ paths: ["./src/"] })
    ]
};