import React from 'react';
import { HashRouter, Route, Routes } from "react-router-dom";
import { Home } from "./Home";
import Body from "./Body";

export const Router: React.VFC = () => 
(
  <HashRouter>
    <Routes>
      <Route path="/" element={<Home/>} />
      <Route path="/body" element={<Body/>} />
    </Routes>
  </HashRouter>
)
export default Router;