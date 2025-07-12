import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import NotLive from './page/notlive';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/notlive" element={<NotLive />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
  );
}
