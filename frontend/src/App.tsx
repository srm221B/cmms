import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ibmTheme from './theme/ibmTheme';
import TopBar from './components/TopBar';
import Assets from './pages/Assets'; // Import the Assets component
import WorkOrders from './pages/WorkOrders'; // Import the WorkOrders component
import Inventory from './pages/Inventory'; // Import the Inventory component

import './App.css';

function App() {
  return (
    <Router>
      <ThemeProvider theme={ibmTheme}>
        <CssBaseline />
        <div className="App">
          <TopBar />
          <main className="App-content">
            <Routes>
              {/* For now, make Assets both the default and explicit route */}
              <Route path="/" element={<Assets />} />
              <Route path="/assets" element={<Assets />} />
              <Route path="/work-orders" element={<WorkOrders />} />
              <Route path="/inventory" element={<Inventory />} />
              
              {/* We'll add more routes later */}
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </Router>
  );
}

export default App;