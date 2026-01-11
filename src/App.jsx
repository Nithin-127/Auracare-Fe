import { Routes, Route, useLocation } from 'react-router-dom';
import Home from './assets/Pages/Home';
import About from './assets/Pages/About';
import Auth from './assets/Pages/Auth';
import Donor from './assets/Pages/Donor';
import Reciver from './assets/Pages/Reciver';
import Contact from './assets/Pages/Contact';
import Profile from './assets/Pages/Profile';
import Admin from './assets/Pages/Admin';
import Aura from './assets/Pages/Aura';
import ReceiverList from './assets/Pages/ReceiverList';
import Premium from './assets/Pages/Premium';
import PaymentSuccess from './assets/Pages/PaymentSuccess';
import BookDoctor from './assets/Pages/BookDoctor';
import Head from './assets/Components/Head';
import Footer from './assets/Components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';

  return (
    <div className="App">
      {!isAdmin && <Head />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/donor" element={<Donor />} />
        <Route path="/receiver" element={<Reciver />} />
        <Route path="/aura" element={<Aura />} />
        <Route path="/receivers-list" element={<ReceiverList />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/book-doctor" element={<BookDoctor />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      {!isAdmin && <Footer />}
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
    </div>
  );
}

export default App;
