import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Sun, AlertTriangle, Github, FileText } from 'lucide-react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import LeetCodeImg from '/LeetCode.png';
import CodeForcesImg from '/CodeForces.png';
import ResumeImg from '/Resume.png';


const Hero = ({ setActiveSection }) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const textRef = useRef(null);
  const [isPrankOpen, setIsPrankOpen] = useState(false);
  const [showHiMessage, setShowHiMessage] = useState(false);
  const [leetcodeData, setLeetcodeData] = useState(null);
  const [isLoadingLeetcode, setIsLoadingLeetcode] = useState(true);
  const [contestRating, setContestRating] = useState(null);

  // Helper function to get LeetCode badge
  const getLeetcodeBadge = () => {
    if (leetcodeData && leetcodeData.badge && leetcodeData.badge.name) {
      const badgeName = leetcodeData.badge.name;
      // Map badge names to colors
      switch (badgeName.toLowerCase()) {
        case 'guardian':
          return { name: 'Guardian', color: 'text-red-400' };
        case 'knight':
          return { name: 'Knight', color: 'text-orange-400' };
        case 'master':
          return { name: 'Master', color: 'text-purple-400' };
        default:
          return { name: badgeName, color: 'text-orange-400' };
      }
    }
    // Fallback to Knight if no badge data
    return { name: 'Knight', color: 'text-orange-400' };
  };

  const handleProfileClick = () => {
    setShowHiMessage(true);
    setTimeout(() => {
      setShowHiMessage(false);
    }, 2000);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveSection('home');
        }
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('home');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [setActiveSection]);

  // Fetch LeetCode contest rating using GraphQL
  useEffect(() => {
    const fetchLeetcodeContestRating = async () => {
      try {
        setIsLoadingLeetcode(true);
        
        const graphqlQuery = {
          query: `
            query userContestRankingInfo($username: String!) {
              userContestRanking(username: $username) {
                attendedContestsCount
                rating
                globalRanking
                totalParticipants
                topPercentage
                badge {
                  name
                }
              }
            }
          `,
          variables: {
            username: "Sudhss"
          }
        };

        const response = await fetch('https://leetcode.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(graphqlQuery)
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.userContestRanking) {
            setContestRating(data.data.userContestRanking.rating);
            setLeetcodeData(data.data.userContestRanking);
          }
        } else {
          console.error('Failed to fetch LeetCode contest rating');
        }
      } catch (error) {
        console.error('Error fetching LeetCode contest rating:', error);
      } finally {
        setIsLoadingLeetcode(false);
      }
    };

    fetchLeetcodeContestRating();
  }, []);

  useEffect(() => {
    if (hasAnimated || !textRef.current) return;

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let iteration = 0;
    const originalText = textRef.current.dataset.value;

    const interval = setInterval(() => {
      textRef.current.innerText = originalText
        .split("")
        .map((letter, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          return letters[Math.floor(Math.random() * 26)];
        })
        .join("");

      if (iteration >= originalText.length) {
        clearInterval(interval);
        setHasAnimated(true);
      }

      iteration += 1 / 3;
    }, 50);

    return () => clearInterval(interval);
  }, [hasAnimated]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1]
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center relative px-4 overflow-hidden pt-22">
      <div className="absolute inset-0"></div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center z-10 max-w-4xl"
      >
        <motion.div
          variants={item}
          className="mb-12 relative w-64 h-64 md:w-80 md:h-80 mx-auto group cursor-pointer"
          onClick={handleProfileClick}
        >
          {/* Cool animated border */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {/* Multiple rotating rings */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30 animate-spin" style={{ animationDuration: '12s' }}></div>
            <div className="absolute inset-1 rounded-full border border-purple-500/40 animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}></div>
            <div className="absolute inset-2 rounded-full border border-cyan-400/20 animate-spin" style={{ animationDuration: '15s' }}></div>

            {/* Floating border particles */}
            {[...Array(8)].map((_, i) => (
              <div
                key={`border-particle-${i}`}
                className="absolute w-2 h-2 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  left: `${50 + 45 * Math.cos((i * 45) * Math.PI / 180)}%`,
                  top: `${50 + 45 * Math.sin((i * 45) * Math.PI / 180)}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Image container with glass effect */}
          <div className="absolute inset-1 rounded-full bg-slate-900/50 backdrop-blur-sm p-2">
            <div className="relative w-full h-full overflow-hidden rounded-full">
              {/* Animated background behind image */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                {/* Floating particles in the circle */}
                {[...Array(12)].map((_, i) => (
                  <div
                    key={`circle-particle-${i}`}
                    className="absolute w-1 h-1 bg-cyan-400/40 rounded-full animate-pulse"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${20 + Math.random() * 60}%`,
                      animationDelay: `${Math.random() * 3}s`,
                      animationDuration: `${2 + Math.random() * 2}s`
                    }}
                  />
                ))}

                {/* Rotating gradient orbs */}
                <div className="absolute inset-0 rounded-full">
                  <div
                    className="absolute w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 animate-spin"
                    style={{
                      left: '20%',
                      top: '30%',
                      animationDuration: '8s'
                    }}
                  />
                  <div
                    className="absolute w-12 h-12 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 animate-spin"
                    style={{
                      right: '25%',
                      top: '20%',
                      animationDuration: '6s',
                      animationDirection: 'reverse'
                    }}
                  />
                  <div
                    className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 animate-spin"
                    style={{
                      left: '60%',
                      bottom: '25%',
                      animationDuration: '10s'
                    }}
                  />
                </div>

                {/* Subtle mesh pattern */}
                <div
                  className="absolute inset-0 rounded-full opacity-30"
                  style={{
                    background: `
                      radial-gradient(circle at 30% 30%, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 70% 70%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.05) 0%, transparent 70%)
                    `,
                    animation: 'pulse 4s ease-in-out infinite'
                  }}
                />
              </div>

              {/* Main image */}
              <LazyLoadImage
                src="Sudhanshu.png"
                placeholderSrc="Sudhanshu.png"
                alt="Sudhanshu Shukla"
                effect="blur"
                className="relative z-10"
              />

              { }
              <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/20 via-transparent to-purple-500/20 mix-blend-overlay group-hover:opacity-0 transition-opacity duration-700"></div>

              { }
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-1/4 left-0 w-full h-px bg-cyan-500/50 animate-glitch-h"></div>
                <div className="absolute top-1/3 left-0 w-full h-px bg-purple-500/50 animate-glitch-h delay-100"></div>
                <div className="absolute top-1/2 left-0 w-full h-px bg-white/50 animate-glitch-h delay-200"></div>
              </div>
            </div>
          </div>

          { }
          <div className="absolute -inset-4 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-cyan-500 rounded-full animate-float"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${i * 0.2}s`
                }}
              ></div>
            ))}
          </div>

          {/* Hi Message */}
          {showHiMessage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.5, x: -20 }}
              className="absolute top-1/2 -right-32 transform -translate-y-1/2 z-50"
            >
              <div className="bg-white text-gray-800 px-6 py-4 rounded-xl shadow-2xl border border-gray-200 backdrop-blur-sm">
                <span className="text-lg font-semibold">Hi! What's up</span>
                <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-4 h-4 bg-white border-l border-b border-gray-200 rotate-45"></div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.h2
          variants={item}
          className="text-xl md:text-2xl mb-4 text-gray-300"
        >
          <span className="text-gradient">Welcome to my digital universe</span>
        </motion.h2>

        <motion.h1
          variants={item}
          className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter group cursor-pointer relative"
          data-value="SUDHANSHU SHUKLA"
          ref={textRef}
          style={{ background: 'linear-gradient(to top, #9CA3AF, #D1D5DB, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          SUDHANSHU SHUKLA
        </motion.h1>

        <motion.div
          variants={item}
          className="h-0.5 w-24 md:w-32 bg-gradient-to-r from-cyan-500 to-fuchsia-500 mx-auto my-8"
        ></motion.div>

        <motion.p
          variants={item}
          className="text-xl md:text-2xl mb-6 text-gray-300"
        >
          Systems and Backend Engineer <span className="text-gray-500">|</span> Problem Solver <span className="text-gray-500">|</span> 6+ years of coding
        </motion.p>

        <motion.div
          variants={item}
          className="flex flex-wrap justify-center gap-6 mb-8"
        >
          <a
            href="https://leetcode.com/u/Sudhss/" target="_blank"
            className="group flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm border border-orange-500/30 rounded-full px-4 py-2 hover:border-orange-400 hover:bg-slate-800/60 transition-all duration-300 hover:scale-105"
          >
            <img src={LeetCodeImg} alt="LeetCode" className="w-9 h-9 object-contain" />
            {isLoadingLeetcode ? (
              <>
                <span className="text-orange-400 font-semibold animate-pulse">Loading...</span>
                <span className="text-white font-bold animate-pulse">---</span>
              </>
            ) : contestRating ? (
              <>
                <span className={`font-semibold ${getLeetcodeBadge().color}`}>
                  {getLeetcodeBadge().name}
                </span>
                <span className="text-white font-bold">{contestRating}</span>
              </>
            ) : (
              <>
                <span className="text-orange-400 font-semibold">Knight</span>
                <span className="text-white font-bold">2000+</span>
              </>
            )}
          </a>

          <a
            href="https://codeforces.com/profile/NonVolatile" target="_blank"
            className="group flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm border border-red-500/30 rounded-full px-4 py-2 hover:border-red-400 hover:bg-slate-800/60 transition-all duration-300 hover:scale-105"
          >
            <img src={CodeForcesImg} alt="CodeForces" className="w-9 h-9 object-contain" />
            <span className="text-red-400 font-semibold">Specialist</span>
            <span className="text-white font-bold">1400+</span>
          </a>

          <a
            href="https://github.com/sudhanshu-shukl" target="_blank"
            className="group flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm border border-gray-500/30 rounded-full px-4 py-2 hover:border-gray-400 hover:bg-slate-800/60 transition-all duration-300 hover:scale-105"
          >
            <Github className="w-9 h-9 text-gray-400" />
            <span className="text-White-400 font-semibold">GitHub</span>
            <span className="text-white font-bold">20+</span>
          </a>
          <a
            href="https://drive.google.com/file/d/1R8GabtOQ7JDsV2kWA2kYOt8z_p1vm7iQ/view?usp=sharing" target="_blank"
            className="group flex items-center gap-2 bg-slate-800/40 backdrop-blur-sm border border-gray-500/30 rounded-full px-4 py-2 hover:border-gray-400 hover:bg-slate-800/60 transition-all duration-300 hover:scale-105"
          >
            <FileText className="w-9 h-9 text-gray-400" />
            <span className="text-white-400 font-semibold">Resume</span>
            {/* <span className="text-white font-bold">50+</span> */}
          </a>
        </motion.div>

      </motion.div>


    </div>
  );
};

export default Hero;