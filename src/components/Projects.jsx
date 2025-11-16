import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Clock, BookOpen, Bot, MessageCircle, Code, Database, MessageSquare, Trophy,Train } from 'lucide-react';
import Tilt from 'react-parallax-tilt';

const Projects = () => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false
  });

  const [sectionRef, sectionInView] = useInView({
    threshold: 0.5,
  });
  const [hasAnimated, setHasAnimated] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, hasAnimated]);

  useEffect(() => {
    if (!sectionInView) return;
    // Update active section in parent component
    const event = new CustomEvent('sectionInView', { detail: 'projects' });
    window.dispatchEvent(event);
  }, [sectionInView]);

  const projects = [
    {
      icon: <MessageCircle className="w-12 h-12 text-cyan-400" />,
      title: "MoodMate (Offline Chat App)",
      description: "Built a privacy‑first, offline chat application using Flask and ReactJS. Supports multiple personas for custom user experience and runs fully locally for reliability and speed.",
      techStack: ["Flask", "ReactJS", "Python"],
      color: "from-purple-500 to-indigo-600",
      liveDemo: "https://sudhanshu-shukl.github.io/MoodMate",
      github: "https://github.com/sudhanshu-shukl/moodmate",
      completed: true
    },
    {
      icon: <Code className="w-12 h-12 text-cyan-400" />,
      title: "Full Stack Expense Manager",
      description: "A simple Expense Tracker built with React, TailwindCSS, Vite, and MongoDB that Tracks expenses, set budgets, visualize data with charts, and export/import CSV files.",
      techStack: ["ReactJS", "Tailwind CSS", "Node.js", "Express", "MongoDB"],
      color: "from-cyan-500 to-blue-600",
      liveDemo: "https://sudhanshu-shukl.github.io/Expense-Manager",
      github: "https://github.com/sudhanshu-shukl/Expense-Manager",
      completed: true
    },
    {
      icon: <Trophy className="w-12 h-12 text-cyan-400" />,
      title: "Contest Manager",
      description: "A full-stack web application for tracking and managing coding contest participation across multiple platforms. Features smart color-coded urgency indicators, performance analytics, and data persistence.",
      techStack: ["React", "Node.js", "MongoDB", "Express.js"],
      color: "from-emerald-500 to-teal-600",
      liveDemo: "https://sudhanshu-shukl.github.io/contest-manager",
      github: "https://github.com/sudhanshu-shukl/contest-manager",
      completed: true
    },
    {
      icon: <Database className="w-12 h-12 text-cyan-400" />,
      title: "Serverless Data Warehouse with Real-Time ETL",
      description: "Built a serverless, distributed data warehouse using AWS Lambda and Google Cloud Functions for real‑time ETL. Integrated Presto for high‑speed querying and IAM for secure access. Automated data pipelines with Terraform.",
      techStack: ["AWS Lambda", "Google Cloud", "Presto", "Terraform"],
      color: "from-teal-500 to-green-600",
      liveDemo: "#",
      github: "https://github.com/sudhanshu-shukl/data-warehouse",
      completed: false
    },
    {
      icon: <MessageSquare className="w-12 h-12 text-cyan-400" />,
      title: "Real-Time Chat Application with WebSockets",
      description: "Built a real-time chat app using WebSockets for seamless communication. Developed with React.js, Node.js and Redis for message storage and session management. Implemented user authentication and message encryption for secure chats.",
      techStack: ["React.js", "Node.js", "WebSockets", "Redis"],
      color: "from-orange-500 to-red-600",
      liveDemo: "#",
      github: "https://github.com/sudhanshu-shukl/chat-app",
      completed: false
    },
    {
      icon: <Train className="w-12 h-12 text-cyan-400" />,
      title: "AI Powered Train Traffic Control System",
      description:
        "AI-driven system that optimizes train movement using Dijkstra’s algorithm and reinforcement learning. Processes real-time station data, detects congestion, predicts delays, and recommends optimal routes.",
      techStack: ["Python", "FastAPI", "React.js", "Reinforcement Learning", "Dijkstra"],
      color: "from-amber-500 to-yellow-600",
      liveDemo: "#",
      github: "https://github.com/Sudhss/SIH_Project",
      completed: false
    }


  ];

  return (
    <section
      ref={sectionRef}
      className="min-h-screen py-20 relative bg-slate-900/50"
    >
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial="hidden"
          animate={hasAnimated ? "visible" : "hidden"}
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.8,
                ease: "easeOut"
              }
            }
          }}
          ref={ref}
          className="text-center mb-16"
        >
          <h2
            data-text="PROJECTS"
            className="glitch-text text-4xl md:text-5xl font-bold mb-8"
            style={{ background: 'linear-gradient(to top, #9CA3AF, #D1D5DB, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            PROJECTS
          </h2>
          <div className="h-0.5 w-24 md:w-32 bg-gradient-to-r from-cyan-500 to-fuchsia-500 mx-auto mb-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-8 max-w-sm mx-auto md:max-w-none">
          {projects.map((project, index) => (
            <Tilt
              key={index}
              className="h-full"
              tiltMaxAngleX={8}
              tiltMaxAngleY={8}
              glareEnable={true}
              glareMaxOpacity={0.1}
              glareColor="#ffffff"
              glarePosition="all"
              scale={1.02}
            >
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: 0.2 * index }}
                className="h-full holographic overflow-hidden rounded-xl group"
              >
                {/* Background gradient */}
                <div className={`h-32 bg-gradient-to-r ${project.color} relative overflow-hidden`}>
                  {/* Floating icon */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-4 rounded-full bg-white/10 backdrop-blur-lg">
                    {project.icon}
                  </div>

                  {/* Decorative elements */}
                  <div className="absolute bottom-0 left-0 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                      <path
                        fill="rgba(15, 23, 42, 0.8)"
                        fillOpacity="1"
                        d="M0,160L48,144C96,128,192,96,288,106.7C384,117,480,171,576,186.7C672,203,768,181,864,154.7C960,128,1056,96,1152,101.3C1248,107,1344,149,1392,170.7L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                      ></path>
                    </svg>
                  </div>
                </div>

                <div className="p-4 md:p-6 relative z-10">
                  <h3 className="text-lg md:text-2xl font-bold mb-3 mt-6 md:mt-8">{project.title}</h3>
                  <p className="text-sm md:text-base text-gray-300 mb-4 md:mb-6">{project.description}</p>

                  <div className="flex flex-col md:flex-row gap-3 mt-auto">
                    <div className="flex flex-wrap gap-2 min-h-[60px]">
                      {project.techStack.map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 md:px-3 py-3 text-xs rounded-full bg-slate-800 text-gray-300"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    {/* Glassmorphism buttons for Live Demo and GitHub */}
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 min-h-[48px]">
                      {project.completed ? (
                        <a
                          href={project.liveDemo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-cyan-200 font-semibold shadow-lg hover:bg-cyan-400/30 hover:text-white transition-all duration-200 border border-cyan-300/20 text-sm md:text-base"
                        >
                          <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          <span className="hidden sm:inline">Live Demo</span>
                          <span className="sm:hidden">Demo</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setModalMessage('Live demo for this project is under progress. Please check back soon!');
                            setModalOpen(true);
                          }}
                          className="inline-flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-cyan-200 font-semibold shadow-lg hover:bg-cyan-400/30 hover:text-white transition-all duration-200 border border-cyan-300/20 focus:outline-none text-sm md:text-base"
                        >
                          <svg className="w-3 md:w-4 h-3 md:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                          <span className="hidden sm:inline">Live Demo</span>
                          <span className="sm:hidden">Demo</span>
                        </button>
                      )}
                      <a
                        href={project.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-3 md:px-4 py-2 rounded-full bg-white/20 backdrop-blur-md text-gray-200 font-semibold shadow-lg hover:bg-gray-700/40 hover:text-white transition-all duration-200 border border-gray-300/20 text-sm md:text-base"
                      >
                        <svg className="w-3 md:w-4 h-3 md:h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.1 3.29 9.43 7.86 10.96.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.7.42.36.79 1.09.79 2.2 0 1.59-.01 2.87-.01 3.26 0 .31.21.68.8.56C20.71 21.45 24 17.12 24 12.02 24 5.74 18.27.5 12 .5z" />
                        </svg>
                        GitHub
                      </a>
                    </div>
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            </Tilt>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <a
            href="#contact"
            className="inline-block px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-white font-medium shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300"
          >
            Interested in collaboration? Contact me
          </a>
        </motion.div>
      </div>

      {/* Modal for under progress message */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-slate-900 rounded-xl p-8 shadow-2xl max-w-xs w-full text-center border border-cyan-400/30">
            <div className="mb-4 text-cyan-300 text-lg font-semibold">🚧 Under Progress</div>
            <div className="mb-6 text-gray-200">{modalMessage}</div>
            <button
              onClick={() => setModalOpen(false)}
              className="px-6 py-2 rounded-full bg-cyan-600 text-white font-semibold shadow hover:bg-cyan-700 transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default Projects;

