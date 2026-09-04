import { Link } from 'react-router-dom';
import { Heart, Sun, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { HeroGeometric } from '@/components/ui/shape-landing-hero';
import SEO from '../components/SEO';

// Assets
import shepherdImg from '@/assets/shepherd.png';
import crossImg from '@/assets/cross-sunrise.png';
import bibleImg from '@/assets/bible-verse.png';

const promises = [
  { ref: "Matthew 11:28", text: "Come to Me, all you who are weary and burdened, and I will give you rest." },
  { ref: "Joshua 1:9", text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord is with you." },
  { ref: "Romans 15:13", text: "May the God of hope fill you with all joy and peace as you trust in Him." }
];

export default function Home() {
  const elementsRef = useRef([]);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
        }
      });
    }, observerOptions);

    elementsRef.current.forEach(el => {
      if (el) {
        el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-4');
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const addToRefs = (el) => {
    if (el && !elementsRef.current.includes(el)) {
      elementsRef.current.push(el);
    }
  };

  return (
    <main>
      <SEO
        title="Zionix | Know Jesus. Know Life. — Daily Bread, Prayer Wall & Holy Bible"
        description="Discover the timeless hope of Jesus Christ. Access daily Scripture reflections, submit prayer requests on our sacred Prayer Wall, and explore the Holy Bible."
        keywords="Christian website, Bible, daily devotional, daily Bible verse, prayer, prayer wall, Gospel, Jesus Christ, Scripture, Christian devotion, Bible reading, Christian faith, Zionix"
        path="/"
      />
      {/* Hero Section */}
      <HeroGeometric badge="Zionix" title1="Jesus Christ" title2="The Way, The Truth, & The Life">
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <Link to="/gospel" className="bg-primary text-center text-on-primary px-8 py-4 rounded font-label-caps text-label-caps uppercase tracking-widest hover:bg-primary-container transition-all active:scale-95 w-full md:w-auto shadow-md">
            Explore the Gospel
          </Link>
          <Link to="/verse" className="border border-outline-variant bg-white/50 text-center text-primary px-8 py-4 rounded font-label-caps text-label-caps uppercase tracking-widest hover:bg-surface-container-low transition-all active:scale-95 w-full md:w-auto shadow-sm">
            Read Today's Verse
          </Link>
        </div>
      </HeroGeometric>

      {/* Spacer between Hero and features to prevent Calvary overlapping */}
      <div className="h-6 md:h-8 bg-background" />

      {/* Feature Highlights (Bento grid) */}
      <section className="py-12 md:py-16 bg-background">
        <div className="max-w-container-max mx-auto px-margin-mobile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {/* Card 1: The Gospel */}
            <div ref={addToRefs} className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-col items-start transition-all hover:border-secondary group">
              <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center mb-stack-sm text-secondary">
                <Heart size={20} className="fill-secondary/20" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">The Gospel</h3>
              <p className="text-on-surface-variant mb-6 text-sm">Discover the life-changing message of salvation and God's unconditional love for humanity.</p>
              <Link className="mt-auto text-secondary font-label-caps text-label-caps uppercase tracking-widest hover:underline text-xs font-bold" to="/gospel">
                Learn More
              </Link>
            </div>

            {/* Card 2: Daily Verse */}
            <div ref={addToRefs} className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-col items-start transition-all hover:border-secondary group">
              <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center mb-stack-sm text-secondary">
                <Sun size={20} />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">Daily Bread</h3>
              <p className="text-on-surface-variant mb-6 text-sm">Receive daily spiritual nourishment with hand-picked scriptures to guide your morning reflection.</p>
              <Link className="mt-auto text-secondary font-label-caps text-label-caps uppercase tracking-widest hover:underline text-xs font-bold" to="/verse">
                Read Now
              </Link>
            </div>

            {/* Card 3: Holy Bible */}
            <div ref={addToRefs} className="bg-surface-container-lowest border border-outline-variant p-stack-md rounded-xl flex flex-col items-start transition-all hover:border-secondary group">
              <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center mb-stack-sm text-secondary">
                <BookOpen size={20} />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-2">Holy Bible</h3>
              <p className="text-on-surface-variant mb-6 text-sm">Deep dive into biblical texts with our advanced exploration tools and cross-references.</p>
              <Link className="mt-auto text-secondary font-label-caps text-label-caps uppercase tracking-widest hover:underline text-xs font-bold" to="/bible">
                Start Exploring
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Verse Block (John 3:16) */}
      <section className="pb-8 bg-background">
        <div className="max-w-3xl mx-auto px-margin-mobile">
          <div ref={addToRefs} className="bg-surface-container-low border-l-4 border-secondary p-stack-lg rounded-r-lg">
            <p className="font-verse-quote text-verse-quote text-primary italic mb-4 leading-relaxed">
              "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life."
            </p>
            <cite className="font-label-caps text-label-caps uppercase tracking-widest text-on-surface-variant not-italic text-xs font-semibold">
              John 3:16 — KJV
            </cite>
          </div>
        </div>
      </section>

      {/* Visual Anchor (Landscape wheat field with high contrast readable text overlay) */}
      <section ref={addToRefs} className="h-[480px] relative overflow-hidden mb-12">
        <img 
          alt="Serene landscape wheat field" 
          className="w-full h-full object-cover" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuD5KaYcdmjdrcFHQyW-DTnDa2-y4sMYrfzj8XuwlN6C1-WiXuPGuR059YeEp7MHlXyIyweIINdO-n-jGudQaVrSGVZ01orbrS-7fCV5SDOWecVYBzJMwqavRQU49qO8cDXu41xEue6e6DT7XunI3462ArYZa-UtqivP0ioyMq-TqPOJZI6tmEFynMqICxmsZrrBKTD_35cUSUID77dV9GFfw709_rvPcfKnu3sJkSMCeqAzEmbvSPlXUBn5YNkFYDWL4QG4bcx6f8A"
        />
        {/* Dark contrast gradient overlay & glass card so text is 100% visible and readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#041534]/90 via-[#041534]/65 to-[#041534]/60 flex items-center justify-center p-4">
          <div className="text-center max-w-2xl mx-auto px-6 py-8 sm:px-10 sm:py-10 bg-[#041534]/80 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl">
            <span className="font-label-caps text-xs uppercase tracking-[0.25em] text-[#fed977] font-bold mb-3 block">
              Timeless Beacon of Hope
            </span>
            <h2 className="font-display-lg text-2xl sm:text-3xl md:text-4xl text-white font-bold tracking-tight mb-3 drop-shadow-md">
              A Lighthouse in the Digital Age
            </h2>
            <p className="font-body-lg text-sm sm:text-base text-white/95 max-w-lg mx-auto leading-relaxed">
              Spreading the immutable truth of the Gospel to every corner of the world.
            </p>
          </div>
        </div>
      </section>

      {/* NEW ATTACHED SECTIONS */}

      {/* Attached Section 1: Featured Verse (John 14:6) */}
      <section ref={addToRefs} className="py-12 md:py-16 px-6 bg-gradient-heaven">
        <div className="max-w-3xl mx-auto text-center">
          <Sparkles className="w-8 h-8 text-accent mx-auto mb-6 animate-float-soft" />
          <blockquote className="font-verse-quote text-2xl md:text-3xl leading-relaxed text-on-surface mb-6">
            "I am the way and the truth and the life. No one comes to the Father except through Me."
          </blockquote>
          <cite className="text-primary font-label-caps text-sm not-italic tracking-widest">— JOHN 14:6</cite>
        </div>
      </section>

      {/* Attached Section 2: Three pillars */}
      <section ref={addToRefs} className="py-12 md:py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-headline-md text-4xl md:text-5xl text-primary mb-4">A Light for Every Soul</h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">Three eternal truths the Lord offers freely to all who come to Him.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Heart, title: "Boundless Love", text: "While we were still sinners, Christ died for us. His love is not earned — it is given." },
              { icon: BookOpen, title: "Living Word", text: "The Scriptures are God speaking to you today, breathing hope into every weary heart." },
              { icon: Sparkles, title: "New Life", text: "If anyone is in Christ, the new creation has come. The old has gone, the new is here." },
            ].map((p) => (
              <div key={p.title} className="p-8 rounded-2xl bg-card border border-border/60 shadow-soft text-left">
                <div className="w-12 h-12 rounded-xl bg-gradient-divine flex items-center justify-center mb-5 shadow-sm">
                  <p.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-headline-sm text-2xl mb-3 text-primary">{p.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{p.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Attached Section 3: Image + verse split (Uncropped Good Shepherd) */}
      <section ref={addToRefs} className="py-12 md:py-16 px-6 bg-card/40 border-y border-outline-variant/20">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="flex items-center justify-center p-2">
            <img 
              src={shepherdImg} 
              alt="Jesus the Good Shepherd carrying a lamb" 
              loading="lazy" 
              className="w-full max-w-md md:max-w-full h-auto object-contain rounded-3xl shadow-divine transition-transform duration-500 hover:scale-[1.01]" 
            />
          </div>
          <div className="text-left">
            <p className="text-primary font-label-caps text-xs tracking-widest mb-3 font-bold">THE GOOD SHEPHERD</p>
            <h2 className="font-headline-md text-3xl sm:text-4xl md:text-5xl text-primary mb-6 leading-tight font-bold">
              He knows your name, and He calls you His own.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              Jesus said: "I am the good shepherd. I know My sheep and My sheep know Me." He searches the wilderness for the one who is lost — and rejoices when they are found.
            </p>
            <blockquote className="border-l-2 border-secondary pl-5 font-verse-quote italic text-lg text-on-surface">
              "The Lord is my shepherd, I lack nothing." <span className="block text-xs font-label-caps not-italic text-primary mt-2">— Psalm 23:1</span>
            </blockquote>
          </div>
        </div>
      </section>

      {/* Attached Section 4: Promises preview */}
      <section ref={addToRefs} className="py-12 md:py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-12 flex-wrap gap-4 text-left">
            <div>
              <h2 className="font-headline-md text-4xl md:text-5xl text-primary mb-2">Promises from the Word</h2>
              <p className="text-muted-foreground text-sm">Eternal truths to carry with you today.</p>
            </div>
            <Link to="/bible" className="text-secondary font-label-caps text-xs inline-flex items-center gap-1 font-bold hover:gap-2 transition-all">
              All verses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {promises.map((v) => (
              <article key={v.ref} className="p-7 rounded-2xl bg-gradient-heaven border border-border/60 hover:shadow-divine transition-all duration-300 text-left">
                <BookOpen className="w-5 h-5 text-accent mb-4" />
                <p className="font-verse-quote italic text-base leading-relaxed text-on-surface mb-4">"{v.text}"</p>
                <p className="text-xs font-label-caps tracking-widest text-primary font-bold">{v.ref.toUpperCase()}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Attached Section 5: CTA */}
      <section ref={addToRefs} className="relative py-20 md:py-24 px-6 overflow-hidden">
        <img src={crossImg} alt="Cross silhouetted against sunrise" loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background/90" />
        <div className="relative max-w-2xl mx-auto text-center z-10">
          <h2 className="font-headline-md text-4xl md:text-5xl text-primary mb-6">Today is the day of salvation.</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Whether you are searching, broken, or simply curious — Jesus is reaching for you. Take the next step.
          </p>
          <Link to="/gospel" className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-divine text-white font-label-caps text-xs uppercase tracking-widest shadow-divine hover:scale-[1.03] transition-transform duration-300 active:scale-95">
            Discover the Gospel <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <img src={bibleImg} alt="" aria-hidden className="hidden" />
    </main>
  );
}
