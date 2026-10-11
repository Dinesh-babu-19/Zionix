import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full py-stack-lg bg-surface-container-low dark:bg-surface-container-highest border-t border-outline-variant/30 mt-auto">
      <div className="max-w-container-max mx-auto px-margin-mobile flex flex-col md:flex-row justify-between items-start gap-stack-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 font-headline-md text-headline-md font-bold text-primary">
            <img 
              src="/logo.png" 
              alt="Zionaviel Logo" 
              className="h-8 w-auto mix-blend-multiply dark:invert dark:mix-blend-screen" 
            />
            <span>Zionaviel</span>
          </div>
          <p className="text-on-surface-variant max-w-sm font-body-md text-sm">
            Sharing the timeless message of Jesus Christ through modern design and accessible scripture.
          </p>

          <div className="flex items-center gap-2.5 mt-1">
            <a
              href="https://www.instagram.com/zionaviel30/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Zionaviel on Instagram"
              title="Instagram: @zionaviel30"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-[#E4405F]/10 text-on-surface-variant hover:text-[#E4405F] border border-outline-variant/30 hover:border-[#E4405F]/40 transition-all font-body-md text-xs font-medium group active:scale-95 shadow-2xs"
            >
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              <span>Instagram</span>
            </a>

            <a
              href="https://www.youtube.com/@Zionaviel"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Subscribe to Zionaviel on YouTube"
              title="YouTube: @Zionaviel"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-red-500/10 text-on-surface-variant hover:text-[#FF0000] border border-outline-variant/30 hover:border-[#FF0000]/40 transition-all font-body-md text-xs font-medium group active:scale-95 shadow-2xs"
            >
              <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              <span>YouTube</span>
            </a>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-primary mb-2 text-xs">Ministry</span>
          <div className="flex flex-wrap md:flex-col gap-x-6 gap-y-2">
            <Link className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" to="/prayer-wall">Prayer Wall</Link>
            <Link className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" to="/gospel">Gospel</Link>
            <Link className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" to="/bible">Holy Bible</Link>
            <Link className="font-body-md text-body-md text-on-tertiary-fixed-variant hover:text-primary hover:underline transition-all text-sm" to="/verse">Daily Verse</Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-container-max mx-auto px-margin-mobile mt-stack-lg pt-stack-sm border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-on-surface-variant font-body-md text-sm">
        <div>© {new Date().getFullYear()} Zionaviel Ministry. All rights reserved.</div>
        <div className="flex items-center gap-3 text-xs text-on-surface-variant/80">
          <a 
            href="https://www.instagram.com/zionaviel30/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#E4405F] transition-colors"
          >
            Instagram
          </a>
          <span>•</span>
          <a 
            href="https://www.youtube.com/@Zionaviel" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-[#FF0000] transition-colors"
          >
            YouTube
          </a>
        </div>
      </div>
    </footer>
  );
}
