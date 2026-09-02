import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full py-stack-lg bg-surface-container-low dark:bg-surface-container-highest border-t border-outline-variant/30 mt-auto">
      <div className="max-w-container-max mx-auto px-margin-mobile flex flex-col md:flex-row justify-between items-start gap-stack-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-primary">
            <img 
              src="/logo.png" 
              alt="Zionix Logo" 
              className="h-8 w-auto mix-blend-multiply dark:invert dark:mix-blend-screen" 
            />
            <span>Zionix</span>
          </div>
          <p className="text-on-surface-variant max-w-sm font-body-md text-sm">
            Sharing the timeless message of Jesus Christ through modern design and accessible scripture.
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-x-16 gap-y-4">
          <div className="flex flex-col gap-2">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-2 text-xs">Ministry</span>
            <Link className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" to="/prayer-wall">Prayer Wall</Link>
            <Link className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" to="/gospel">Gospel</Link>
            <Link className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" to="/bible">Holy Bible</Link>
            <Link className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" to="/verse">Daily Verse</Link>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-2 text-xs">Legal</span>
            <a className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" href="#privacy">Privacy Policy</a>
            <a className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" href="#terms">Terms of Service</a>
          </div>
          
          <div className="flex flex-col gap-2">
            <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-2 text-xs">Connect</span>
            <a className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" href="#contact">Contact</a>
            <a className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" href="#support">Support</a>
          </div>
        </div>
      </div>
      
      <div className="max-w-container-max mx-auto px-margin-mobile mt-stack-lg pt-stack-sm border-t border-outline-variant/30 text-on-surface-variant font-body-md text-sm">
        © {new Date().getFullYear()} Zionix Ministry. All rights reserved.
      </div>
    </footer>
  );
}
