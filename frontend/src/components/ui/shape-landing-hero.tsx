"use client";

import { motion } from "framer-motion";
import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Cross SVG Icon for 100% reliability
function CrossIcon({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 2v20" />
            <path d="M7 9h10" />
        </svg>
    );
}

function ElegantShape({
    className,
    delay = 0,
    width = 400,
    height = 100,
    rotate = 0,
    gradient = "from-amber-500/[0.2]",
    borderClass = "border-amber-500/[0.18]",
    shadowClass = "shadow-amber-500/[0.08]",
}: {
    className?: string;
    delay?: number;
    width?: number;
    height?: number;
    rotate?: number;
    gradient?: string;
    borderClass?: string;
    shadowClass?: string;
}) {
    return (
        <motion.div
            initial={{
                opacity: 0,
                y: -150,
                rotate: rotate - 15,
            }}
            animate={{
                opacity: 1,
                y: 0,
                rotate: rotate,
            }}
            transition={{
                duration: 2.4,
                delay,
                ease: [0.23, 0.86, 0.39, 0.96],
                opacity: { duration: 1.2 },
            }}
            className={cn("absolute", className)}
        >
            <motion.div
                animate={{
                    y: [0, 15, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                style={{
                    width,
                    height,
                }}
                className="relative"
            >
                <div
                    className={cn(
                        "absolute inset-0 rounded-full",
                        "bg-gradient-to-r to-transparent",
                        gradient,
                        "backdrop-blur-[4px] border-2",
                        borderClass,
                        "shadow-[0_8px_32px_0]",
                        shadowClass,
                        "after:absolute after:inset-0 after:rounded-full",
                        "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.7),transparent_70%)]"
                    )}
                />
            </motion.div>
        </motion.div>
    );
}

function FloatingCross({
    className,
    delay = 0,
    scale = 1,
    opacity = 0.28,
}: {
    className?: string;
    delay?: number;
    scale?: number;
    opacity?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: scale * 0.7 }}
            animate={{ opacity, scale }}
            transition={{ duration: 3, delay, ease: "easeOut" }}
            className={cn("absolute pointer-events-none select-none flex items-center justify-center", className)}
        >
            {/* Pulsing glow background at the cross intersection */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.9, 0.4],
                }}
                transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                className="absolute w-[120px] h-[120px] bg-amber-300/30 rounded-full blur-2xl -translate-y-[40px]"
            />
            {/* The vertical bar */}
            <div className="absolute w-[3px] h-[260px] bg-gradient-to-b from-transparent via-amber-500 to-transparent blur-[0.5px]" />
            {/* The horizontal bar */}
            <div className="absolute w-[150px] h-[3px] bg-gradient-to-r from-transparent via-amber-500 to-transparent blur-[0.5px] -translate-y-[50px]" />
        </motion.div>
    );
}

function FloatingHeart({
    className,
    delay = 0,
    scale = 1,
    opacity = 0.22,
    duration = 14,
    colorClass = "text-rose-400/40 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]",
}: {
    className?: string;
    delay?: number;
    scale?: number;
    opacity?: number;
    duration?: number;
    colorClass?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: scale * 0.7, y: 150 }}
            animate={{
                opacity: [0, opacity, opacity, 0],
                scale: [scale * 0.7, scale, scale * 1.08, scale * 0.8],
                y: [150, -180],
                x: [0, 25, -25, 0],
            }}
            transition={{
                duration,
                delay,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
            }}
            className={cn("absolute pointer-events-none select-none flex items-center justify-center", className)}
        >
            <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className={cn("w-8 h-8 md:w-10 md:h-10", colorClass)}
            >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
        </motion.div>
    );
}

function LightSparkle({
    className,
    delay = 0,
    scale = 1,
    duration = 9,
}: {
    className?: string;
    delay?: number;
    scale?: number;
    duration?: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0, y: 100 }}
            animate={{
                opacity: [0, 0.7, 0.7, 0],
                scale: [0, scale, scale * 1.2, 0],
                y: [100, -120],
                x: [0, 15, -15, 0],
            }}
            transition={{
                duration,
                delay,
                ease: "easeOut",
                repeat: Number.POSITIVE_INFINITY,
            }}
            className={cn("absolute pointer-events-none select-none text-amber-300", className)}
        >
            <Sparkles className="h-4 w-4 fill-amber-300/30" />
        </motion.div>
    );
}

function DivineLightRay() {
    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
            {/* Central Soft Divine Glow */}
            <motion.div
                animate={{
                    scale: [0.95, 1.12, 0.95],
                    opacity: [0.45, 0.7, 0.45],
                }}
                transition={{
                    duration: 10,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
                className="absolute w-[400px] h-[400px] md:w-[700px] md:h-[700px] bg-gradient-to-r from-amber-200/25 via-rose-100/15 to-yellow-100/10 rounded-full blur-[90px]"
            />

            {/* Glowing Conic Light Beams */}
            <motion.div
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 90,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                }}
                className="absolute w-[900px] h-[900px] md:w-[1300px] md:h-[1300px] opacity-[0.06] bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.45)_0%,transparent_65%)]"
                style={{
                    maskImage: "repeating-conic-gradient(from_0deg, black_0deg_10deg, transparent_10deg_20deg)",
                    WebkitMaskImage: "repeating-conic-gradient(from_0deg, black_0deg_10deg, transparent_10deg_20deg)",
                }}
            />

            {/* Secondary counter-rotating light beams */}
            <motion.div
                animate={{
                    rotate: -360,
                }}
                transition={{
                    duration: 140,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                }}
                className="absolute w-[900px] h-[900px] md:w-[1300px] md:h-[1300px] opacity-[0.04] bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.3)_0%,transparent_60%)]"
                style={{
                    maskImage: "repeating-conic-gradient(from_0deg, black_0deg_12deg, transparent_12deg_24deg)",
                    WebkitMaskImage: "repeating-conic-gradient(from_0deg, black_0deg_12deg, transparent_12deg_24deg)",
                }}
            />
        </div>
    );
}

function CalvaryCrossCentral({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 120 180"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <filter id="auraGlow" x="-40%" y="-40%" width="180%" height="180%">
                    <feGaussianBlur stdDeviation="8" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <linearGradient id="centralCrossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#081b3d" />
                    <stop offset="100%" stopColor="#010712" />
                </linearGradient>
            </defs>

            {/* Glowing Divine Aura around the intersection */}
            <motion.circle
                cx="60"
                cy="65"
                r="22"
                fill="rgba(251, 191, 36, 0.45)"
                filter="url(#auraGlow)"
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.6, 0.9, 0.6],
                }}
                transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                }}
            />

            {/* Rays radiating from the Center Cross intersection */}
            <motion.g
                animate={{
                    rotate: 360,
                }}
                transition={{
                    duration: 75,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                }}
                className="opacity-25"
                style={{ transformOrigin: '60px 65px' }}
            >
                {[...Array(8)].map((_, i) => (
                    <line
                        key={i}
                        x1="60"
                        y1="65"
                        x2="60"
                        y2="-15"
                        stroke="#fb923c"
                        strokeWidth="1.2"
                        strokeDasharray="3,9"
                        transform={`rotate(${i * 45} 60 65)`}
                        className="opacity-60"
                    />
                ))}
            </motion.g>

            {/* Vertical Beam */}
            <rect x="57" y="15" width="6" height="150" fill="url(#centralCrossGrad)" />
            {/* Horizontal Beam */}
            <rect x="30" y="50" width="60" height="6" fill="url(#centralCrossGrad)" />

            {/* Stylized Body of Jesus Christ laid on the cross */}
            {/* Head */}
            <circle cx="60" cy="48" r="2.5" fill="#041534" />
            {/* Outstretched Arms */}
            <path
                d="M42,47 Q51,49 60,51 Q69,49 78,47"
                fill="none"
                stroke="#041534"
                strokeWidth="2.2"
                strokeLinecap="round"
            />
            {/* Torso & Leg Silhouette */}
            <path
                d="M60,51 Q58.5,75 59.3,95 Q60,102 60,110"
                fill="none"
                stroke="#041534"
                strokeWidth="3"
                strokeLinecap="round"
            />
            {/* Draped Shroud (White Linen cloth representing His sacrifice, draped over the crossbar) */}
            <path
                d="M52,47 C55,65 55,75 56,88 C58,87 58.5,87 58.5,78 C59.3,75 59.3,68 58.5,47 Z"
                fill="#fefefe"
                opacity="0.8"
            />
            <path
                d="M68,47 C65,65 65,75 64,88 C62,87 61.5,87 61.5,78 C60.7,75 60.7,68 61.5,47 Z"
                fill="#fefefe"
                opacity="0.8"
            />
        </svg>
    );
}

function CalvaryCrossSide({ className, angle = 0 }: { className?: string; angle?: number }) {
    return (
        <svg
            viewBox="0 0 40 80"
            className={className}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ transform: `rotate(${angle}deg)` }}
        >
            <defs>
                <linearGradient id="sideCrossGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#081b3d" />
                    <stop offset="100%" stopColor="#010712" />
                </linearGradient>
            </defs>
            {/* Vertical */}
            <rect x="18.5" y="10" width="3" height="60" fill="url(#sideCrossGrad)" />
            {/* Horizontal */}
            <rect x="10" y="25" width="20" height="3" fill="url(#sideCrossGrad)" />
        </svg>
    );
}

function CalvaryScene() {
    return (
        <div className="absolute inset-x-0 bottom-0 h-[180px] md:h-[220px] pointer-events-none select-none overflow-hidden z-[2]">
            {/* Background Sky / Dawn Horizon Glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/[0.12] via-rose-500/[0.03] to-transparent" />

            {/* Drifting Clouds behind the hill */}
            <motion.div
                animate={{
                    x: ["-5%", "5%", "-5%"]
                }}
                transition={{
                    duration: 50,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut"
                }}
                className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.2),transparent_70%)]"
            />

            {/* Hills SVG - stretches naturally to fit screen width */}
            <svg
                viewBox="0 0 1440 200"
                className="absolute bottom-0 w-full h-full"
                preserveAspectRatio="none"
            >
                <defs>
                    {/* Hill Gradient */}
                    <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#041534" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="#010712" stopOpacity="1" />
                    </linearGradient>
                </defs>

                {/* Left Hill */}
                <path
                    d="M-100,200 Q200,165 500,190 T1100,200 L1100,220 L-100,220 Z"
                    fill="url(#hillGrad)"
                    className="opacity-70"
                />

                {/* Right Hill */}
                <path
                    d="M400,200 Q900,160 1540,185 L1540,220 L400,220 Z"
                    fill="url(#hillGrad)"
                    className="opacity-80"
                />

                {/* Central Hill (Golgotha / Calvary) */}
                <path
                    d="M200,200 Q720,150 1240,200 L1240,220 L200,220 Z"
                    fill="url(#hillGrad)"
                />
            </svg>

            {/* Individual absolute-positioned, perfectly proportion-locked crosses */}
            
            {/* Left Cross (tilted slightly left) */}
            <CalvaryCrossSide 
                className="absolute left-[12%] md:left-[22%] bottom-[27px] md:bottom-[33px] w-[30px] h-[60px] md:w-[40px] md:h-[80px] z-[3] opacity-70" 
                angle={-6} 
            />

            {/* Right Cross (tilted slightly right) */}
            <CalvaryCrossSide 
                className="absolute right-[12%] md:right-[22%] bottom-[29px] md:bottom-[35px] w-[30px] h-[60px] md:w-[40px] md:h-[80px] z-[3] opacity-80" 
                angle={5} 
            />

            {/* Central Cross of Jesus Christ (Perfect Aspect Ratio & Glowing details) */}
            <CalvaryCrossCentral 
                className="absolute left-1/2 -translate-x-1/2 bottom-[45px] md:bottom-[55px] w-[90px] h-[135px] md:w-[120px] md:h-[180px] z-[4]" 
            />

            {/* Drifting embers/particles rising from Calvary */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5, y: 200, x: 500 + i * 100 }}
                        animate={{
                            opacity: [0, 0.5, 0],
                            y: [200, 50],
                            x: [500 + i * 100, 515 + i * 100 + (i % 2 === 0 ? 15 : -15)]
                        }}
                        transition={{
                            duration: 10 + i * 2,
                            delay: i * 2,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut"
                        }}
                        className="absolute w-1 h-1 rounded-full bg-amber-400/40 blur-[0.5px]"
                    />
                ))}
            </div>

            {/* Fading bottom overlay to blend Calvary with the next section */}
            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#fdfcf9] to-transparent z-[5]" />
        </div>
    );
}

function HeroGeometric({
    badge = "King of Kings & Lord of Lords",
    title1 = "Jesus Christ",
    title2 = "The Way, The Truth, & The Life",
    children,
}: {
    badge?: string;
    title1?: string;
    title2?: string;
    children?: React.ReactNode;
}) {
    const fadeUpVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: {
                duration: 1,
                delay: 0.5 + i * 0.2,
                ease: [0.25, 0.4, 0.25, 1],
            },
        }),
    };

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#fdfcf9]">
            {/* Luminous, heavenly background gradients */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.08] via-transparent to-rose-500/[0.08] blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,244,200,0.85),transparent_60%)]" />

            {/* Divine Light Rays representing Christ as Light of the World */}
            <DivineLightRay />

            {/* Glowing Christian cross motifs floating in background */}
            <FloatingCross className="left-[4%] md:left-[10%] top-[12%]" delay={0.2} scale={1.1} opacity={0.3} />
            <FloatingCross className="right-[4%] md:right-[15%] bottom-[12%]" delay={0.8} scale={0.95} opacity={0.25} />
            <FloatingCross className="left-[35%] md:left-[42%] top-[5%] scale-[0.6] opacity-[0.15]" delay={1.4} />

            {/* Floating Hearts representing Christ's divine Love */}
            <FloatingHeart className="left-[8%] md:left-[18%] bottom-[20%]" delay={1} scale={1} opacity={0.25} duration={14} colorClass="text-rose-400/40 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
            <FloatingHeart className="right-[8%] md:right-[12%] top-[25%]" delay={3} scale={0.8} opacity={0.2} duration={12} colorClass="text-rose-300/35 drop-shadow-[0_0_8px_rgba(244,63,94,0.25)]" />
            <FloatingHeart className="left-[25%] md:left-[30%] top-[30%]" delay={5} scale={0.65} opacity={0.15} duration={16} colorClass="text-amber-400/30 drop-shadow-[0_0_6px_rgba(245,158,11,0.2)]" />
            <FloatingHeart className="right-[22%] md:right-[28%] bottom-[15%]" delay={7} scale={0.9} opacity={0.22} duration={15} colorClass="text-rose-400/40 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
            <FloatingHeart className="left-[45%] md:left-[48%] bottom-[8%]" delay={9} scale={0.75} opacity={0.18} duration={13} colorClass="text-amber-300/35 drop-shadow-[0_0_6px_rgba(252,211,77,0.25)]" />

            {/* Twinkling divine sparkles representing His light */}
            <LightSparkle className="left-[15%] top-[45%]" delay={0.5} scale={1.1} />
            <LightSparkle className="right-[20%] top-[50%]" delay={2.5} scale={0.9} />
            <LightSparkle className="left-[40%] bottom-[35%]" delay={4.5} scale={1.2} />
            <LightSparkle className="right-[45%] top-[20%]" delay={6.5} scale={0.8} />
            <LightSparkle className="left-[70%] top-[15%]" delay={1.5} scale={1} />
            <LightSparkle className="right-[75%] bottom-[25%]" delay={8} scale={1.3} />

            <div className="absolute inset-0 overflow-hidden">
                {/* Luminous floating elements */}
                <ElegantShape
                    delay={0.3}
                    width={600}
                    height={140}
                    rotate={12}
                    gradient="from-amber-400/[0.22] to-amber-200/[0.03]"
                    borderClass="border-amber-500/[0.2]"
                    shadowClass="shadow-amber-500/[0.08]"
                    className="left-[-10%] md:left-[-5%] top-[15%] md:top-[20%]"
                />

                <ElegantShape
                    delay={0.5}
                    width={500}
                    height={120}
                    rotate={-15}
                    gradient="from-rose-300/[0.22] to-rose-200/[0.03]"
                    borderClass="border-rose-400/[0.2]"
                    shadowClass="shadow-rose-400/[0.08]"
                    className="right-[-5%] md:right-[0%] top-[70%] md:top-[75%]"
                />

                <ElegantShape
                    delay={0.4}
                    width={300}
                    height={80}
                    rotate={-8}
                    gradient="from-amber-300/[0.2] to-amber-200/[0.03]"
                    borderClass="border-amber-400/[0.18]"
                    shadowClass="shadow-amber-400/[0.08]"
                    className="left-[5%] md:left-[10%] bottom-[5%] md:bottom-[10%]"
                />

                <ElegantShape
                    delay={0.6}
                    width={200}
                    height={60}
                    rotate={20}
                    gradient="from-yellow-400/[0.22] to-yellow-200/[0.03]"
                    borderClass="border-yellow-400/[0.2]"
                    shadowClass="shadow-yellow-400/[0.08]"
                    className="right-[15%] md:right-[20%] top-[10%] md:top-[15%]"
                />

                <ElegantShape
                    delay={0.7}
                    width={150}
                    height={40}
                    rotate={-25}
                    gradient="from-orange-300/[0.18] to-orange-200/[0.03]"
                    borderClass="border-orange-400/[0.15]"
                    shadowClass="shadow-orange-400/[0.06]"
                    className="left-[20%] md:left-[25%] top-[5%] md:top-[10%]"
                />
            </div>

            {/* Calvary hill background scene */}
            <CalvaryScene />

            <div className="relative z-10 container mx-auto px-4 md:px-6 pt-16 md:pt-24 pb-48 md:pb-60">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Christ Badge */}
                    <motion.div
                        custom={0}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/[0.04] border border-amber-500/[0.15] mb-8 md:mb-12 shadow-[0_2px_12px_rgba(251,191,36,0.05)]"
                    >
                        <Crown className="h-4 w-4 text-amber-600 fill-amber-500/10" />
                        <span className="text-sm font-medium text-amber-800 tracking-wide">
                            {badge}
                        </span>
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    </motion.div>

                    {/* Luminous Scripture Heading */}
                    <motion.div
                        custom={1}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold mb-6 md:mb-8 tracking-tight font-display text-[#041534]">
                            <span className="bg-clip-text text-transparent bg-gradient-to-b from-[#041534] via-[#0b2b63] to-[#123e85]">
                                {title1}
                            </span>
                            <br />
                            <span
                                className={cn(
                                    "bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 font-medium italic"
                                )}
                            >
                                {title2}
                            </span>
                        </h1>
                    </motion.div>

                    {/* Holy Scripture Quote */}
                    <motion.div
                        custom={2}
                        variants={fadeUpVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div className="max-w-2xl mx-auto px-4">
                            <p className="text-base sm:text-lg md:text-xl text-[#041534]/70 mb-4 leading-relaxed font-light tracking-wide italic font-verse-quote">
                                "He is the image of the invisible God, the firstborn of all creation. For by Him all things were created, in heaven and on earth..."
                            </p>
                            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700/80 font-label-caps">
                                Colossians 1:15-16
                            </span>
                        </div>
                    </motion.div>

                    {/* Action buttons inside the animated sequence */}
                    {children && (
                        <motion.div
                            custom={3}
                            variants={fadeUpVariants}
                            initial="hidden"
                            animate="visible"
                            className="mt-10"
                        >
                            {children}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Serene fade-out gradient blending with the section below */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#fdfcf9] to-transparent pointer-events-none z-[4]" />
        </div>
    );
}

export { HeroGeometric }
