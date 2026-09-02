import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  ShieldCheck, 
  Compass, 
  Sparkles, 
  Flame, 
  Heart, 
  Infinity, 
  ArrowRight, 
  AlertTriangle, 
  CornerDownRight,
  Anchor,
  Flame as SpiritIcon
} from 'lucide-react';

export default function GospelClarity() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 60,
        damping: 15
      }
    }
  };

  const blessings = [
    { title: "Forgiveness of sins", icon: Heart, desc: "All your past, present, and future offenses are washed clean through His blood.", color: "from-red-500/20 to-red-500/5 text-red-600 dark:text-red-400" },
    { title: "Peace with God", icon: Compass, desc: "The hostility of sin is removed, giving you a restored relationship and quiet confidence.", color: "from-blue-500/20 to-blue-500/5 text-blue-600 dark:text-blue-400" },
    { title: "The gift of the Holy Spirit", icon: SpiritIcon, desc: "God's own Spirit resides within you to guide, comfort, and empower your walk.", color: "from-amber-500/20 to-amber-500/5 text-amber-600 dark:text-amber-400" },
    { title: "Adoption into God's family", icon: ShieldCheck, desc: "You become a son or daughter of the King of Kings, with full family inheritance.", color: "from-indigo-500/20 to-indigo-500/5 text-indigo-600 dark:text-indigo-400" },
    { title: "A new life in Christ", icon: Sparkles, desc: "The old self is dead; you are recreated from the inside out to walk in newness.", color: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 dark:text-emerald-400" },
    { title: "The promise of eternal life", icon: Infinity, desc: "Death is no longer the end, but the gateway to endless joy in His presence forever.", color: "from-purple-500/20 to-purple-500/5 text-purple-600 dark:text-purple-400" }
  ];

  return (
    <main className="pt-24 pb-20 bg-background text-on-surface">
      <div className="max-w-[800px] mx-auto px-margin-mobile">
        {/* Breadcrumbs */}
        <nav className="mb-8">
          <ol className="flex items-center gap-2 font-label-caps text-xs text-on-surface-variant/70 uppercase tracking-widest">
            <li><Link className="hover:text-primary transition-colors" to="/">Home</Link></li>
            <li><ChevronRight size={12} className="text-on-surface-variant/40" /></li>
            <li className="text-secondary font-bold">Gospel</li>
          </ol>
        </nav>

        {/* Narrative Flow */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-12"
        >
          {/* Header */}
          <motion.header variants={itemVariants} className="text-center md:text-left border-b border-outline-variant/30 pb-8">
            <span className="font-label-caps text-xs uppercase tracking-[0.2em] text-secondary font-bold mb-2 block">
              The Message of Salvation
            </span>
            <h1 className="font-display-lg text-4xl md:text-6xl text-primary font-bold leading-tight tracking-tight mb-4">
              The Gospel of Jesus Christ
            </h1>
            <p className="font-body-lg text-lg text-on-surface-variant leading-relaxed max-w-[700px]">
              This is the single most important message on this website—and indeed, in all of human history. Explore the truth of who Christ is and what He accomplished for you.
            </p>
          </motion.header>

          {/* Section 1: Creation and Fall */}
          <motion.section variants={itemVariants} className="relative pl-6 md:pl-8 border-l-2 border-outline/30">
            <span className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-outline"></span>
            <h2 className="font-headline-md text-2xl md:text-3xl text-primary font-bold mb-4">
              Our Need: Creation and Separation
            </h2>
            <div className="font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed flex flex-col gap-4">
              <p>
                God created mankind to know Him, love Him, and live in fellowship with Him. Yet all people have sinned against God and fallen short of His glory.
              </p>
              <p className="bg-surface-container-low/50 p-5 rounded-xl border border-outline-variant/30 italic text-on-surface font-verse-quote text-base">
                Because God is holy and just, sin separates us from Him, and no amount of good works, religion, or personal effort can remove our guilt or make us righteous before Him.
              </p>
            </div>
          </motion.section>

          {/* Section 2: The Savior */}
          <motion.section variants={itemVariants} className="relative pl-6 md:pl-8 border-l-2 border-outline/30">
            <span className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-outline"></span>
            <h2 className="font-headline-md text-2xl md:text-3xl text-primary font-bold mb-4">
              God's Answer: The Holy Savior
            </h2>
            <p className="font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed">
              In His great love and mercy, God sent His eternal Son, Jesus Christ, into the world. Jesus was miraculously conceived by the Holy Spirit and born of the virgin Mary. He is fully God and fully man, and He lived a perfect and sinless life, completely obeying the Father in every way.
            </p>
          </motion.section>

          {/* Section 3: The Cross */}
          <motion.section 
            variants={itemVariants} 
            className="relative bg-gradient-to-br from-primary-container to-primary text-on-primary p-8 rounded-2xl border border-primary/20 shadow-divine"
          >
            <div className="absolute top-4 right-4 text-secondary-fixed opacity-10">
              <Anchor size={120} />
            </div>
            <h2 className="font-headline-md text-2xl md:text-3xl text-secondary-fixed-dim font-bold mb-4">
              The Substitution: Death on the Cross
            </h2>
            <p className="font-body-lg text-base md:text-lg text-primary-fixed-dim leading-relaxed mb-4">
              Jesus willingly went to the cross and died for our sins. Though He was without sin, He took upon Himself the punishment that we deserved.
            </p>
            <p className="font-body-lg text-base md:text-lg font-medium text-white leading-relaxed">
              Through His sacrificial death, He paid the penalty for sin and made a way for sinners to be reconciled to God.
            </p>
          </motion.section>

          {/* Section 4: Resurrection & Ascension */}
          <motion.section variants={itemVariants} className="relative pl-6 md:pl-8 border-l-2 border-outline/30">
            <span className="absolute -left-[5px] top-1.5 w-[9px] h-[9px] rounded-full bg-secondary"></span>
            <h2 className="font-headline-md text-2xl md:text-3xl text-primary font-bold mb-4 flex items-center gap-2">
              The Victory: Risen and Reigning
            </h2>
            <p className="font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed">
              Jesus was buried, and on the third day He rose bodily from the dead according to the Scriptures. By His resurrection, He conquered sin, death, and the grave. He later ascended into heaven and now reigns as Lord and King.
            </p>
          </motion.section>

          {/* Section 5: The Offer & Blessings */}
          <motion.section variants={itemVariants} className="py-2">
            <h2 className="font-headline-md text-2xl md:text-3xl text-primary font-bold mb-4">
              The Divine Offer: What We Receive
            </h2>
            <p className="font-body-lg text-base md:text-lg text-on-surface-variant leading-relaxed mb-6">
              God offers forgiveness and salvation to all who repent of their sins and place their faith in Jesus Christ alone. Those who believe in Him receive:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blessings.map((b, i) => (
                <div 
                  key={i} 
                  className="flex gap-4 p-5 bg-surface-container-lowest border border-outline-variant/65 rounded-xl hover:border-secondary hover:shadow-sm transition-all duration-300 group"
                >
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${b.color} h-fit`}>
                    <b.icon size={20} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-base font-bold text-primary mb-1">
                      {b.title}
                    </h3>
                    <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Section 6: Warning & Rejection */}
          <motion.section 
            variants={itemVariants} 
            className="p-8 bg-error-container/30 border border-error/20 rounded-2xl relative overflow-hidden"
          >
            <div className="flex gap-4">
              <div className="p-3 bg-error/10 text-error rounded-xl h-fit">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 className="font-headline-md text-xl md:text-2xl text-error font-bold mb-3">
                  The Consequence of Rejecting Christ
                </h2>
                <div className="font-body-lg text-sm md:text-base text-on-surface-variant leading-relaxed flex flex-col gap-3">
                  <p>
                    Those who reject Jesus Christ remain in their sins and under God's righteous judgment. Since Christ is the only Savior provided by God, there is no other way to be saved apart from Him.
                  </p>
                  <p className="font-bold text-error/90">
                    The Bible warns that those who refuse God's gift of salvation will face eternal separation from God.
                  </p>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Section 7: Call to Faith */}
          <motion.section 
            variants={itemVariants} 
            className="bg-gradient-divine text-white p-8 md:p-12 rounded-2xl shadow-divine text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none"></div>
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="font-headline-md text-2xl md:text-3xl text-white font-bold mb-4 drop-shadow-sm">
                Turn & Believe
              </h2>
              <p className="font-body-lg text-base md:text-lg leading-relaxed mb-8 max-w-[620px] mx-auto text-white/95">
                Therefore, turn from your sin and place your faith in Jesus Christ alone. He was born for our salvation, died for our sins, rose again in victory, and offers eternal life to all who believe in Him.
              </p>
              <Link 
                to="/bible" 
                onClick={() => window.scrollTo(0, 0)}
                className="inline-flex items-center justify-center gap-3 bg-[#041534] hover:bg-[#0a2352] text-white font-bold px-8 py-4 rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer font-label-caps text-xs uppercase tracking-widest border border-white/20"
              >
                <span>Explore Holy Bible</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </motion.section>

          {/* Section 8: Key Verse Quote */}
          <motion.section 
            variants={itemVariants} 
            className="border-y border-outline-variant/30 py-8 text-center my-4"
          >
            <blockquote className="font-verse-quote text-2xl md:text-3xl text-primary italic leading-relaxed max-w-[650px] mx-auto text-balance">
              "Believe in the Lord Jesus, and you will be saved."
            </blockquote>
            <cite className="block mt-4 font-label-caps text-xs tracking-[0.2em] text-secondary font-bold not-italic">
              — THE HOLY BIBLE (ACTS 16:31)
            </cite>
          </motion.section>
        </motion.div>
      </div>
    </main>
  );
}
