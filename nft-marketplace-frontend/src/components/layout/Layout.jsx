import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import ParticlesBackground from '../effects/ParticlesBackground';

const Layout = () => {
  return (
    <div className="min-h-screen bg-dark-100">
      <div className="relative z-0">
        {/* Background effects */}
        <div className="fixed inset-0 z-[-2]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,246,255,0.15),transparent_25%,transparent_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(176,38,255,0.1),transparent_25%,transparent_100%)]" 
               style={{ transform: 'translate(10%, 10%)' }} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,16,240,0.1),transparent_25%,transparent_100%)]"
               style={{ transform: 'translate(-10%, -10%)' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="fixed inset-0 z-[-1] bg-[url('/grid.svg')] opacity-20" />

        {/* Animated particles */}
        <ParticlesBackground />

        {/* Content */}
        <div className="relative z-10">
          <Navbar />
          <main className="pt-16 min-h-[calc(100vh-64px)]">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Layout; 