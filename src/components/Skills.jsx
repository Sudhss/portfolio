import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Code, Database, Cloud, MonitorSmartphone, Brush, Brain } from 'lucide-react';
import { Code2, Braces, Coffee, Globe, FileCode, GitBranch, Github, Server, Boxes, Network, Workflow, Leaf, HardDrive } from 'lucide-react';

const Skills = () => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false
  });
  
  const [sectionRef, sectionInView] = useInView({
    threshold: 0.5,
  });
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, hasAnimated]);

  useEffect(() => {
    if (!sectionInView) return;
    // Ye hai to update active section update k liyein parent component
    const event = new CustomEvent('sectionInView', { detail: 'skills' });
    window.dispatchEvent(event);
  }, [sectionInView]);

  const skillCategories = [
    {
      icon: <Code className="w-8 h-8 text-cyan-400" />,
      title: "Programming Languages",
      skills: [
        { name: "C++", proficiency: 75 },
        { name: "Python", proficiency: 85 },
        { name: "C", proficiency: 70 },
        { name: "JavaScript (ES6+)", proficiency: 90 },
        { name: "Java", proficiency: 80 },
      ],
    },
    {
      icon: <MonitorSmartphone className="w-8 h-8 text-cyan-400" />,
      title: "Web Development",
      skills: [
        { name: "HTML, CSS, JavaScript", proficiency: 95 },
        { name: "ReactJS", proficiency: 85 },
        { name: "ExpressJS", proficiency: 85 },
        { name: "NextJS", proficiency: 80 },
        { name: "Node", proficiency: 80 },
        { name: "REST APIs", proficiency: 85 },
      ],
    },
    {
      icon: <Database className="w-8 h-8 text-cyan-400" />,
      title: "Database Management",
      skills: [
        { name: "MySQL", proficiency: 80 },
        { name: "MongoDB", proficiency: 80 },
        { name: "Redis", proficiency: 70 },
      ],
    },
    {
      icon: <Server className="w-8 h-8 text-cyan-400" />,
      title: "System Design",
      skills: [
        { name: "High-Level Design", proficiency: 75 },
        { name: "Microservices", proficiency: 75 },
        { name: "Scalability Patterns", proficiency: 70 },
        { name: "API Design", proficiency: 80 },
      ],
    },
    {
      icon: <GitBranch className="w-8 h-8 text-cyan-400" />,
      title: "Dev Tools",
      skills: [
        { name: "CI/CD (GitHub Actions)", proficiency: 70 },
        { name: "Git", proficiency: 85 },
        { name: "GitHub", proficiency: 85 },
        { name: "GitLab", proficiency: 85 }
      ],
    },
  ];

  const softSkills = [
    "Problem Solving",
    "Critical thinking",
    "Effective communication",
    "Collaboration",
    "Time management",
    "Adaptability",
    "Fast Learner",
    "Ownership",
  ];

  // Map lucide icons to skills for visual bullets
  const iconMap = {
    Python: <Code2 className="w-4 h-4 text-cyan-400" />,
    'C': <Braces className="w-4 h-4 text-cyan-400" />,
    'C++': <Braces className="w-4 h-4 text-cyan-400" />,
    Java: <Coffee className="w-4 h-4 text-cyan-400" />,
    PHP: <Code2 className="w-4 h-4 text-cyan-400" />,
    'JavaScript (ES6+)': <FileCode className="w-4 h-4 text-cyan-400" />,
    HTML: <Globe className="w-4 h-4 text-cyan-400" />,
    CSS: <Brush className="w-4 h-4 text-cyan-400" />,
    ReactJS: <Code2 className="w-4 h-4 text-cyan-400" />,
    NextJS: <Code2 className="w-4 h-4 text-cyan-400" />,
    SQL: <Database className="w-4 h-4 text-cyan-400" />,
    MySQL: <Database className="w-4 h-4 text-cyan-400" />,
    MongoDB: <Leaf className="w-4 h-4 text-green-400" />,
    Redis: <HardDrive className="w-4 h-4 text-red-400" />,
    'Database Design': <Database className="w-4 h-4 text-cyan-400" />,
    'Query Optimization': <Database className="w-4 h-4 text-cyan-400" />,
    'High-Level Design': <Server className="w-4 h-4 text-cyan-400" />,
    Microservices: <Boxes className="w-4 h-4 text-cyan-400" />,
    'Scalability Patterns': <Network className="w-4 h-4 text-cyan-400" />,
    'API Design': <Network className="w-4 h-4 text-cyan-400" />,
    'REST APIs': <Network className="w-4 h-4 text-cyan-400" />,
    'CI/CD (GitHub Actions)': <Workflow className="w-4 h-4 text-cyan-400" />,
    Git: <GitBranch className="w-4 h-4 text-cyan-400" />,
    GitHub: <Github className="w-4 h-4 text-cyan-400" />,
    'Adobe Photoshop': <Brush className="w-4 h-4 text-cyan-400" />,
  };

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
            data-text="SKILLS" 
            className="glitch-text text-4xl md:text-5xl font-bold mb-8"
            style={{background: 'linear-gradient(to top, #9CA3AF, #D1D5DB, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}
          >
            SKILLS
          </h2>
          <div className="h-0.5 w-24 md:w-32 bg-gradient-to-r from-cyan-500 to-fuchsia-500 mx-auto mb-8"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="holographic p-6 rounded-lg"
            >
              <div className="flex items-center mb-6">
                <div className="p-3 bg-slate-800/70 rounded-lg mr-4">
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold">{category.title}</h3>
              </div>
              <ul className="space-y-3">
                {category.skills.map((skill, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ x: -20, opacity: 0 }}
                    animate={hasAnimated ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + 0.05 * idx }}
                    className="flex items-center gap-3 group"
                  >
                    <span className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-800/80 border border-white/10 shadow-sm">
                      {iconMap[skill.name] || <Code2 className="w-4 h-4 text-cyan-400" />}
                      <span className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/0 to-fuchsia-500/0 group-hover:from-cyan-500/10 group-hover:to-fuchsia-500/10 transition-colors"></span>
                    </span>
                    <span className="text-gray-200 font-medium">
                      {skill.name}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16"
        >
          <h3 className="text-2xl font-bold mb-8 text-center">Soft Skills</h3>
          
          <div className="max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-3 gap-6">
            {softSkills.map((skill, index) => (
              <motion.div
                key={index}
                initial={{ x: -30, opacity: 0 }}
                animate={hasAnimated ? { x: 0, opacity: 1 } : { x: -30, opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.7 + 0.1 * index }}
                className="flex items-center"
              >
                <div className="w-2 h-2 rounded-full bg-cyan-500 mr-3"></div>
                <span className="text-gray-300">{skill}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
