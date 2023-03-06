import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from "react-router-dom";
import { Home } from "./Home";
import { Body } from "./Body";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
        <Routes>
            <Route path="/home" element={<Home/>} />
            <Route path="/" element={<Body/>} />
        </Routes>
    </HashRouter>
  </StrictMode>
);