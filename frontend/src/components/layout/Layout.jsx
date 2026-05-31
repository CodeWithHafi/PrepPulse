// components/layout/Layout.jsx
import { useEffect, useState } from 'react';
import Sidebar   from './Sidebar';
import BottomNav from './BottomNav';

export default function Layout({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <div className="app-shell">
      {!isMobile && <Sidebar />}
      <main className="main-content">
        {children}
      </main>
      {isMobile && <BottomNav />}
    </div>
  );
}
