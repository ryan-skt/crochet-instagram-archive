
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Archive from './pages/Archive';
import Detail from './pages/Detail';
import Import from './pages/Import';
import Review from './pages/Review';
import Duplicates from './pages/Duplicates';
import Settings from './pages/Settings';
import Sources from './pages/Sources';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="archive" element={<Archive />} />
          <Route path="archive/:id" element={<Detail />} />
          <Route path="import" element={<Import />} />
          <Route path="sources" element={<Sources />} />
          <Route path="review" element={<Review />} />
          <Route path="duplicates" element={<Duplicates />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
