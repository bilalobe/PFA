import React from 'react';
import { Provider } from 'react-redux';
import store from './store';
import GlobalErrorDisplay from './GlobalErrorDisplay';
import HomeGuard from './HomeGuard';

const App: React.FC = () => (
  <Provider store={store}>
    <GlobalErrorDisplay />
    <HomeGuard />
  </Provider>
);

export default App;
