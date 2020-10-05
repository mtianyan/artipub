const { strictEslint } = require('@umijs/fabric');

module.exports = {
  ...strictEslint,
  globals: {
    ANT_DESIGN_PRO_ONLY_DO_NOT_USE_IN_YOUR_PRODUCTION: true,
    page: true,
  },
  rules: {
    ...strictEslint.rules,
    '@typescript-eslint/camelcase': 0,
    'no-nested-ternary': 0,
    "import/no-extraneous-dependencies": ["error", {"devDependencies": true}]
  },
};
