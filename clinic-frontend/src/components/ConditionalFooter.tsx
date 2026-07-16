import { useLocation } from 'react-router-dom';
import Footer from './Footer';

export default function ConditionalFooter() {
  const location = useLocation();
  const isAdminOrPortal = location.pathname.startsWith('/admin') || location.pathname.startsWith('/doctor-portal');

  if (isAdminOrPortal) return null;

  return <Footer />;
}
