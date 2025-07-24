import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PriceCalculator from './components/PriceCalculator';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-8">
                <Link to="/" className="text-xl font-bold text-gray-800">
                  🚗 Travel Price Calculator
                </Link>
                <div className="flex space-x-4">
                  <Link
                    to="/"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                  >
                    🏠 Trang chủ
                  </Link>
                  <Link
                    to="/admin"
                    className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md font-medium"
                  >
                    ⚙️ Quản trị
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            <Routes>
              <Route path="/" element={<PriceCalculator />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;