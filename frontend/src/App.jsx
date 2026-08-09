import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import Markets from './pages/Markets.jsx';
import Login from './pages/Login.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produits" element={<Products />} />
          <Route path="/marches" element={<Markets />} />
          <Route path="/login" element={<Login />} />
        </Routes>
        <footer className="footer">
          <div className="footer__inner">
            <span className="footer__logo">FarmGate</span>
            <p>Transparence sur les prix agricoles au Burkina Faso</p>
            <p className="footer__note">Données indicatives. Consultez les prix officiels avant toute négociation.</p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
