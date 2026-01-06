import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Trainer } from './components/Trainer';
import { StatsPage } from './components/stats/StatsPage';
import { SRSPage } from './components/srs/SRSPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Trainer />} />
        <Route path="/srs" element={<SRSPage />} />
        <Route path="/stats" element={<StatsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
