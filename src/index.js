/* eslint-disable no-param-reassign */

module.exports = {
  name: require('./package').name,

  included(parent) {
    // eslint-disable-next-line prefer-rest-params
    this._super && this._super(...arguments);
    this.patchConfig(parent);
  },

  patchConfig(parent) {
    // Create `parent.options.autoImport.webpack = {}`
    if (!parent.options) parent.options = {};
    if (!parent.options.autoImport) parent.options.autoImport = {};
    const { autoImport } = parent.options;
    if (!autoImport.webpack) autoImport.webpack = {};
    const { webpack } = autoImport;

    // Unshift `.ts` extension to `webpack.resolve.extensions`
    if (!webpack.resolve) webpack.resolve = { extensions: ['.ts', '.js'] };
    else if (!webpack.resolve.extensions)
      webpack.resolve.extensions = ['.ts', '.js'];
    else if (!webpack.resolve.extensions.includes('.ts'))
      webpack.resolve.extensions.unshift('.ts');

    const tsModuleRule = {
      test: /\.ts$/,
      use: {
        loader: 'babel-loader-8',
        options: {
          plugins: [
            // Transpile class properties
            // @see https://github.com/typed-ember/ember-cli-typescript/blob/b2e75abc98beefe635b6cfd8808c887813acb44e/ts/addon.ts#L99
            require.resolve('@babel/plugin-proposal-class-properties'),

            // Transpile new syntax, which is apparently not yet handled by
            // `@babel/preset-env`.
            // @see https://github.com/typed-ember/ember-cli-typescript/blob/b2e75abc98beefe635b6cfd8808c887813acb44e/ts/addon.ts#L89-L94
            require.resolve('@babel/plugin-proposal-optional-chaining'),
            require.resolve(
              '@babel/plugin-proposal-nullish-coalescing-operator'
            )
          ],
          presets: [
            // Transpile TypeScript
            require.resolve('@babel/preset-typescript'),
            // Transpile incompatible syntax for project build targets
            [
              require.resolve('@babel/preset-env'),
              {
                modules: false,
                targets: this.project.targets
              }
            ]
          ]
        }
      }
    };

    // Push `tsModuleRule` into `webpack.module.rules`
    if (!webpack.module) webpack.module = { rules: [tsModuleRule] };
    else if (!webpack.module.rules) webpack.module.rules = [tsModuleRule];
    else webpack.module.rules.push(tsModuleRule);
  }
};
