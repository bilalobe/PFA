import React from 'react';
import ReactDOM from 'react-dom/client'; 
import './index.css'; // Import your main CSS file
import { Provider } from 'react-redux'; 
import store from './store'; // Import your Redux store
import HomeGuard from './HomeGuard'; // Import your HomeGuard component

// Get the root element from the HTML
const rootElement = document.getElementById('root'); 

// Create a React root
const root = ReactDOM.createRoot(rootElement);

// Render your application inside the Provider (for Redux)
root.render(
    <Provider store={store}>
        <HomeGuard />
    </Provider>
    
  
      
        
      
  
);