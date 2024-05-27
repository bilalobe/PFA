
module.exports = {  
  parserOptions: {  
    ecmaVersion: 2021,  
    sourceType: 'module',  
    ecmaFeatures: {  
      jsx: true,  
    },  
  },  
  plugins: ['react', 'prettier'],  
  extends: [  
    'eslint:recommended',  
    'plugin:react/recommended',  
    'prettier',  
  ],  
  rules: {  
    'prettier/prettier': 'error',  
    'react/prop-types': 'off',  
  },  
  settings: {  
    react: {  
      version: 'detect',  
    },  
  },  
};  