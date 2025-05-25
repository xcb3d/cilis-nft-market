import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';
import WalletButton from '../common/WalletButton';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Explore', href: '/explore' },
    { name: 'Create', href: '/create' },
    { name: 'Profile', href: '/profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="relative">
        {/* Glassmorphism background */}
        <div className="absolute inset-0 bg-glass-dark backdrop-blur-xl border-b border-white/10" />

        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-holographic from-neon-purple via-neon-blue to-neon-pink animate-pulse-glow" />
              <span className="text-2xl font-display font-bold bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink bg-clip-text text-transparent">
                NFT Market
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="relative text-gray-300 hover:text-white transition-colors group"
                >
                  {link.name}
                  <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-gradient-to-r from-neon-blue to-neon-purple transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                </Link>
              ))}
              <WalletButton />
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <span className="sr-only">Open menu</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="relative">
            <div className="absolute inset-0 bg-glass-dark backdrop-blur-xl" />
            <div className="relative px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="px-3 py-2">
                <WalletButton />
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 