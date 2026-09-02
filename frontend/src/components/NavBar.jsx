import { NavLink, Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, logout, openAuthModal } = useAuth();

  const handleSignOut = () => {
    logout();
    setIsOpen(false);
  };


  const handleNavLinkClick = (to) => {
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleMobileNavLinkClick = (to) => {
    setIsOpen(false);
    if (location.pathname === to) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeStyle = "font-label-caps text-label-caps uppercase tracking-widest text-secondary border-b-2 border-secondary pb-1 cursor-pointer transition-all active:scale-95";
  const inactiveStyle = "font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors cursor-pointer active:scale-95";

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-md border-b border-outline-variant/30">
      <nav className="max-w-container-max mx-auto px-margin-mobile flex justify-between items-center h-16">
        <Link 
          to="/" 
          onClick={() => handleNavLinkClick('/')}
          className="flex items-center gap-2.5 group"
        >
          <img 
            src="/logo.png" 
            alt="Zionix Logo" 
            className="h-8 w-auto mix-blend-multiply dark:invert dark:mix-blend-screen transition-transform duration-300 group-hover:scale-105" 
          />
          <span className="font-headline-sm text-[20px] font-bold text-primary dark:text-primary-fixed">
            Zionix
          </span>
          <span className="hidden min-[450px]:inline-block h-4 w-[1px] bg-outline-variant/60 mx-0.5"></span>
          <span className="hidden min-[450px]:inline-block text-[11px] font-bold text-secondary uppercase tracking-[0.18em] font-label-caps self-center pt-0.5 whitespace-nowrap">
            Know Jesus
          </span>
        </Link>
        
        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-x-8">
          <NavLink 
            to="/prayer-wall" 
            onClick={() => handleNavLinkClick('/prayer-wall')}
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
          >
            Prayer Wall
          </NavLink>
          <NavLink 
            to="/gospel" 
            end 
            onClick={() => handleNavLinkClick('/gospel')}
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
          >
            Gospel
          </NavLink>
          <NavLink 
            to="/verse" 
            onClick={() => handleNavLinkClick('/verse')}
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
          >
            Daily Bread
          </NavLink>
          <NavLink 
            to="/bible" 
            onClick={() => handleNavLinkClick('/bible')}
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
          >
            Holy Bible
          </NavLink>
          <NavLink 
            to="/gospel/explore" 
            onClick={() => handleNavLinkClick('/gospel/explore')}
            className={({ isActive }) => isActive ? activeStyle : inactiveStyle}
          >
            Gospel Cards
          </NavLink>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-surface-container-low border border-outline-variant/40 px-3.5 py-1.5 rounded-full shadow-sm">
                <div className="w-7 h-7 rounded-full bg-gradient-divine text-white flex items-center justify-center font-bold text-xs shadow-inner">
                  {user.avatar || user.name[0]}
                </div>
                <span className="text-xs font-semibold font-label-caps text-primary tracking-wide">
                  {user.name.split(' ')[0]}
                </span>
              </div>
              <button 
                onClick={handleSignOut}
                className="text-on-surface-variant hover:text-error transition-colors font-label-caps text-label-caps uppercase tracking-widest text-xs font-semibold cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link 
              to="/login"
              className="hidden md:inline-block bg-primary text-on-primary px-6 py-2 rounded-lg font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary-container transition-all cursor-pointer active:scale-95 text-center text-xs"
            >
              Sign In
            </Link>
          )}
          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-primary hover:bg-surface-container-high rounded-lg">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </nav>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-surface border-b border-outline-variant/30 py-4 px-margin-mobile flex flex-col gap-4 animate-fade-in">
          {user && (
            <div className="flex items-center gap-2.5 pb-2 border-b border-outline-variant/20">
              <div className="w-8 h-8 rounded-full bg-gradient-divine text-white flex items-center justify-center font-bold text-xs">
                {user.avatar || user.name[0]}
              </div>
              <div>
                <p className="text-xs font-bold text-primary font-label-caps">{user.name}</p>
                <p className="text-[10px] text-on-surface-variant">{user.email}</p>
              </div>
            </div>
          )}
          <NavLink 
            to="/prayer-wall" 
            onClick={() => handleMobileNavLinkClick('/prayer-wall')} 
            className={({ isActive }) => `block py-2 ${isActive ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}
          >
            Prayer Wall
          </NavLink>
          <NavLink 
            to="/gospel" 
            end 
            onClick={() => handleMobileNavLinkClick('/gospel')} 
            className={({ isActive }) => `block py-2 ${isActive ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}
          >
            Gospel List
          </NavLink>
          <NavLink 
            to="/gospel/explore" 
            onClick={() => handleMobileNavLinkClick('/gospel/explore')} 
            className={({ isActive }) => `block py-2 ${isActive ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}
          >
            Gospel Cards
          </NavLink>
          <NavLink 
            to="/verse" 
            onClick={() => handleMobileNavLinkClick('/verse')} 
            className={({ isActive }) => `block py-2 ${isActive ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}
          >
            Daily Verse
          </NavLink>
          <NavLink 
            to="/bible" 
            onClick={() => handleMobileNavLinkClick('/bible')} 
            className={({ isActive }) => `block py-2 ${isActive ? 'text-secondary font-bold' : 'text-on-surface-variant'}`}
          >
            Holy Bible
          </NavLink>
          {user ? (
            <button 
              onClick={handleSignOut}
              className="block w-full text-left py-2 text-error font-bold border-t border-outline-variant/20 mt-2"
            >
              Sign Out
            </button>
          ) : (
            <NavLink 
              to="/login" 
              onClick={() => handleMobileNavLinkClick('/login')} 
              className="block py-2 text-primary font-bold border-t border-outline-variant/20 mt-2"
            >
              Sign In
            </NavLink>
          )}
        </div>
      )}

    </header>
  );
}
