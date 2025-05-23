// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './utils/i18n.tsx'; // make sure to import it here

createRoot(document.getElementById('root')!).render(
  // <StrictMode>
    <App />
  // </StrictMode>,
)
