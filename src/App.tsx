import { Route, Routes, Navigate } from 'react-router-dom';
import AdminLayout from './layouts/AdminLayout';
import Watchlist from './pages/Watchlist';
import SymbolDetail from './pages/SymbolDetail';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Watchlist />} />
        <Route path="symbol/:code" element={<SymbolDetail />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
