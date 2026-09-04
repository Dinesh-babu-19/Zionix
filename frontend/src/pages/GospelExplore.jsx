import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronRight, 
  ArrowLeft, 
  ArrowRight, 
  Heart, 
  Gift, 
  Compass, 
  Sun, 
  Sparkles, 
  AlertTriangle, 
  ShieldCheck, 
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import SEO from '../components/SEO';

export default function GospelExplore() {
  const { requireAuth } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for back, 1 for next

  const steps = [
    {
      title: "Our Need: Creation & Separation",
      icon: Heart,
      highlight: "God created mankind to know Him, love Him, and live in fellowship with Him.",
      body: "Yet all people have sinned against God and fallen short of His glory. Because God is holy and just, sin separates us from Him, and no amount of good works, religion, or personal effort can remove our guilt or make us righteous before Him.",
      bg: "from-blue-500/10 to-indigo-500/5 border-blue-500/20 text-blue-900 dark:text-blue-200",
      accent: "text-blue-600"
    },
    {
      title: "God's Gift: The Savior",
      icon: Gift,
      highlight: "In His great love and mercy, God sent His eternal Son, Jesus Christ, into the world.",
      body: "Jesus was miraculously conceived by the Holy Spirit and born of the virgin Mary. He is fully God and fully man, and He lived a perfect and sinless life, completely obeying the Father in every way.",
      bg: "from-amber-500/10 to-yellow-500/5 border-amber-500/20 text-amber-900 dark:text-amber-200",
      accent: "text-amber-600"
    },
    {
      title: "The Sacrifice: The Cross",
      icon: Compass,
      highlight: "Jesus willingly went to the cross and died for our sins.",
      body: "Though He was without sin, He took upon Himself the punishment that we deserved. Through His sacrificial death, He paid the penalty for sin and made a way for sinners to be reconciled to God.",
      bg: "from-red-500/10 to-rose-500/5 border-red-500/20 text-red-900 dark:text-red-200",
      accent: "text-red-600"
    },
    {
      title: "The Victory: Risen & Reigning",
      icon: Sun,
      highlight: "Jesus was buried, and on the third day He rose bodily from the dead according to the Scriptures.",
      body: "By His resurrection, He conquered sin, death, and the grave. He later ascended into heaven and now reigns as Lord and King.",
      bg: "from-orange-500/10 to-amber-500/5 border-orange-500/20 text-orange-900 dark:text-orange-200",
      accent: "text-orange-600"
    },
    {
      title: "The Offer: Grace & Blessings",
      icon: Sparkles,
      highlight: "God offers forgiveness and salvation to all who repent of their sins and place their faith in Jesus Christ alone.",
      body: "Those who believe in Him receive: Forgiveness of sins, Peace with God, The gift of the Holy Spirit, Adoption into God's family, A new life in Christ, and The promise of eternal life.",
      bg: "from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-900 dark:text-emerald-200",
      accent: "text-emerald-600",
      list: [
        "Forgiveness of sins",
        "Peace with God",
        "The gift of the Holy Spirit",
        "Adoption into God's family",
        "A new life in Christ",
        "The promise of eternal life"
      ]
    },
    {
      title: "The Consequence of Rejection",
      icon: AlertTriangle,
      highlight: "Those who reject Jesus Christ remain in their sins and under God's righteous judgment.",
      body: "Since Christ is the only Savior provided by God, there is no other way to be saved apart from Him. The Bible warns that those who refuse God's gift of salvation will face eternal separation from God.",
      bg: "from-rose-500/10 to-red-600/5 border-rose-500/20 text-rose-900 dark:text-rose-200",
      accent: "text-rose-600"
    },
    {
      title: "Your Response: Turn & Believe",
      icon: ShieldCheck,
      highlight: "Therefore, turn from your sin and place your faith in Jesus Christ alone.",
      body: "He was born for our salvation, died for our sins, rose again in victory, and offers eternal life to all who believe in Him.",
      bg: "from-purple-500/10 to-indigo-500/5 border-purple-500/20 text-purple-900 dark:text-purple-200",
      accent: "text-purple-600",
      quote: '"Believe in the Lord Jesus, and you will be saved." — The Holy Bible'
    }
  ];

  const handleNext = () => {
    requireAuth(() => {
      if (activeStep < steps.length - 1) {
        setDirection(1);
        setActiveStep(prev => prev + 1);
      }
    });
  };

  const handleBack = () => {
    requireAuth(() => {
      if (activeStep > 0) {
        setDirection(-1);
        setActiveStep(prev => prev - 1);
      }
    });
  };

  const handleReset = () => {
    requireAuth(() => {
      setDirection(-1);
      setActiveStep(0);
    });
  };

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 100 : -100,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (dir) => ({
      x: dir > 0 ? -100 : 100,
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  const ActiveIcon = steps[activeStep].icon;

  return (
    <main className="pt-24 pb-20 bg-background min-h-screen text-on-surface flex flex-col justify-between">
      <SEO
        title="Interactive Gospel Journey | 5 Steps of Faith | Zionix"
        description="An interactive visual exploration of God's redemptive story: Creation & Separation, The Savior, The Cross, The Victory, and Grace & Eternal Life."
        keywords="Gospel journey, steps of faith, God's love, Jesus sacrifice, eternal life cards, Gospel exploration, Zionix"
        path="/gospel/explore"
      />
      <div className="max-w-[700px] w-full mx-auto px-margin-mobile flex-1 flex flex-col">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center gap-2 font-label-caps text-xs text-on-surface-variant/70 uppercase tracking-widest">
            <li><Link className="hover:text-primary transition-colors" to="/">Home</Link></li>
            <li><ChevronRight size={12} className="text-on-surface-variant/40" /></li>
            <li><Link className="hover:text-primary transition-colors" to="/gospel">Gospel</Link></li>
            <li><ChevronRight size={12} className="text-on-surface-variant/40" /></li>
            <li className="text-secondary font-bold">Gospel Cards</li>
          </ol>
        </nav>

        {/* Title */}
        <header className="mb-8 border-b border-outline-variant/30 pb-4 flex justify-between items-end">
          <div>
            <span className="font-label-caps text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-1 block">
              Interactive Deck
            </span>
            <h1 className="font-display-lg text-3xl md:text-4xl text-primary font-bold">
              Explore the Gospel
            </h1>
          </div>
          <div className="font-label-caps text-xs font-semibold text-on-surface-variant bg-surface-container-low px-3.5 py-1.5 rounded-full border border-outline-variant/40">
            Step {activeStep + 1} of {steps.length}
          </div>
        </header>

        {/* Card Arena */}
        <div className="flex-1 flex flex-col justify-center my-4 min-h-[420px] relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeStep}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className={`w-full bg-gradient-to-br ${steps[activeStep].bg} border p-8 md:p-10 rounded-2xl shadow-divine flex flex-col justify-between gap-6 min-h-[400px]`}
            >
              {/* Card Header & Icon */}
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-headline-md text-2xl md:text-3xl text-primary font-bold leading-tight">
                  {steps[activeStep].title}
                </h2>
                <div className={`p-3 rounded-xl bg-white/70 border border-white/50 ${steps[activeStep].accent} shadow-sm`}>
                  <ActiveIcon size={24} />
                </div>
              </div>

              {/* Card Content */}
              <div className="flex-1 flex flex-col gap-4">
                <p className="font-verse-quote text-lg md:text-xl font-medium text-primary leading-relaxed">
                  {steps[activeStep].highlight}
                </p>
                
                {steps[activeStep].list ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {steps[activeStep].list.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-on-surface-variant font-body-md">
                        <CheckCircle2 size={16} className={steps[activeStep].accent} />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-body-md text-sm md:text-base text-on-surface-variant leading-relaxed">
                    {steps[activeStep].body}
                  </p>
                )}

                {steps[activeStep].quote && (
                  <div className="mt-4 border-t border-primary/10 pt-4 text-center">
                    <p className="font-verse-quote italic text-base md:text-lg text-primary font-semibold">
                      {steps[activeStep].quote}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Bar & Indicators */}
        <div className="mt-4 flex flex-col gap-6">
          {/* Progress dots */}
          <div className="flex justify-center gap-2.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setDirection(idx > activeStep ? 1 : -1);
                  setActiveStep(idx);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === activeStep 
                    ? 'w-8 bg-secondary' 
                    : 'w-2.5 bg-outline-variant/60 hover:bg-outline-variant'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={handleBack}
              disabled={activeStep === 0}
              className={`flex items-center gap-2 px-5 py-3 rounded-lg border font-label-caps text-xs uppercase tracking-widest transition-all ${
                activeStep === 0 
                  ? 'border-outline-variant/30 text-on-surface-variant/30 cursor-not-allowed' 
                  : 'border-outline hover:bg-surface-container active:scale-95 text-primary'
              }`}
            >
              <ArrowLeft size={14} /> Back
            </button>

            {activeStep === steps.length - 1 ? (
              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 bg-transparent border border-outline hover:bg-surface-container text-primary px-5 py-3 rounded-lg font-label-caps text-xs uppercase tracking-widest transition-all active:scale-95"
                >
                  <RotateCcw size={14} /> Restart
                </button>
                <Link
                  to="/gospel"
                  className="flex items-center gap-2 bg-primary text-white hover:bg-primary-container px-6 py-3 rounded-lg font-label-caps text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md font-bold"
                >
                  Read Full Text <ArrowRight size={14} />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 bg-primary text-white hover:bg-primary-container px-6 py-3 rounded-lg font-label-caps text-xs uppercase tracking-widest transition-all active:scale-95 shadow-md font-bold"
              >
                Next <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
