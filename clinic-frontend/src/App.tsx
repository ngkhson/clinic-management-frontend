// File: src/App.tsx (Chép đè lên file App.tsx cũ)
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import DoctorDetailPage from './pages/DoctorDetailPage';
import DoctorPortalPage from './pages/DoctorPortalPage';
import AdminPortalPage from './pages/AdminPortalPage';
import PatientDashboardPage from './pages/PatientDashboardPage';
import Navbar from './components/Navbar';
import ConditionalFooter from './components/ConditionalFooter';
import ChatWidget from './components/ChatWidget';
import ScrollToTop from './components/ScrollToTop';
import DoctorListPage from './pages/DoctorListPage';
import UserProfilePage from './pages/UserProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ContactPage from './pages/ContactPage';
import AdminMedicinePage from './pages/AdminMedicinePage';
import PaymentResultPage from './pages/PaymentResultPage';
import SpecialtyDetailPage from './pages/SpecialtyDetailPage';
import SpecialtiesPage from './pages/SpecialtiesPage';
import HealthGuidePage from './pages/HealthGuidePage';
import ArticleDetailPage from './pages/ArticleDetailPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';

// Một component trang chủ tạm thời để test sau khi đăng nhập thành công
// const TemporaryHomePage = () => {
//   const token = localStorage.getItem('token');
//   const email = localStorage.getItem('userEmail');

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('userEmail');
//     window.location.href = '/login'; // F5 lại trang và đẩy về login
//   };

//   if (!token) {
//     return <Navigate to="/login" replace />; // Nếu chưa có token, đá văng về Login
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
//       <div className="bg-white p-8 rounded-xl shadow-md text-center">
//         <h1 className="text-3xl font-bold text-green-600 mb-4">Đăng nhập thành công! 🎉</h1>
//         <p className="text-gray-700 mb-6">Xin chào, <strong>{email}</strong></p>
//         <div className="p-4 bg-gray-50 rounded text-left mb-6 break-all">
//           <p className="text-xs text-gray-500 font-mono">Token của bạn:</p>
//           <p className="text-xs text-gray-800 font-mono mt-1">{token}</p>
//         </div>
//         <button 
//           onClick={handleLogout}
//           className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
//         >
//           Đăng xuất
//         </button>
//       </div>
//     </div>
//   );
// };

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <BrowserRouter>
        <ScrollToTop />
      {/* Đặt Navbar nằm ngoài Routes để nó luôn hiển thị ở mọi trang */}
        <Navbar />
        <div className="flex-grow flex flex-col">
          <Routes>
        {/* Đường dẫn mặc định (Trang chủ) */}
        <Route path="/" element={<HomePage />} />
        
        {/* Đường dẫn Đăng nhập */}
        <Route path="/login" element={<LoginPage />} />
        {/* Đường dẫn Đăng ký */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/doctor/:id" element={<DoctorDetailPage />} />
        <Route path="/specialties" element={<SpecialtiesPage />} />
        <Route path="/specialty/:id" element={<SpecialtyDetailPage />} />
        <Route path="/doctor-portal" element={<DoctorPortalPage />} />
        <Route path="/admin" element={<AdminPortalPage />} />
        <Route path="/patient-dashboard" element={<PatientDashboardPage />} />
        <Route path="/doctors" element={<DoctorListPage />} />
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/health-guide" element={<HealthGuidePage />} />
        <Route path="/health-guide/article/:id" element={<ArticleDetailPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route path="/admin/medicines" element={<AdminMedicinePage />} />
          <Route path="/payment-result" element={<PaymentResultPage />} />
        </Routes>
        </div>
        <ConditionalFooter />
        <ChatWidget />
      </BrowserRouter>
    </div>
  );
}

export default App;