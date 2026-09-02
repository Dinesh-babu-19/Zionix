import NavBar from './NavBar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavBar />
      <div className="flex-1">
        {children}
      </div>
      <Footer />
    </div>
  );
}
