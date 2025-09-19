import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Initialize client-side security
import('./security/ClientSecurity.ts').then(({ default: ClientSecurity }) => {
  new ClientSecurity();
}).catch(console.error);

console.log('Main.jsx loaded - attempting to render App');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 