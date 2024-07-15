import ReactDOM from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import './index.css'


export const start = () => {
  const rootElement = document.getElementById('root')!;
  ReactDOM.createRoot(rootElement).render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    
  )
}
