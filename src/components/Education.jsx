import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { GraduationCap, School } from 'lucide-react';

const Education = () => {
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
    // Update active section in parent component
    const event = new CustomEvent('sectionInView', { detail: 'education' });
    window.dispatchEvent(event);
  }, [sectionInView]);

  const educationItems = [
    {
      icon: <GraduationCap className="w-10 h-10 text-cyan-400" />,
      degree: "B.Tech in Artificial Intelligence & Machine Learning",
      institution: "NIET, Greater Noida",
      duration: "2023 - 2027 (Expected)",
      description: "Currently in final year, exploring the depths of AI and ML technologies while participating in various tech events and hackathons.\n",
      subjects: ["Python, C, C++, Java", "SQL, MongoDB, Firebase", "Data Structures and Algorithms"]
    },
    {
      icon: <School className="w-10 h-10 text-cyan-400" />,
      degree: "Higher Secondary Education (Computer Science)",
      institution: "Army Public School No.2, Jabalpur",
      duration: "2020 - 2022",
      description: "Focused on computer science fundamentals, data structures, and algorithms, laying the groundwork for my tech journey.\n",
      subjects: ["Computer Science - Python, C", "Mathematics"]
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
            data-text="EDUCATION" 
            className="glitch-text text-4xl md:text-5xl font-bold mb-8"
            style={{background: 'linear-gradient(to top, #9CA3AF, #D1D5DB, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}
          >
            EDUCATION
          </h2>
          <div className="h-0.5 w-24 md:w-32 bg-gradient-to-r from-cyan-500 to-fuchsia-500 mx-auto mb-8"></div>
        </motion.div>
        
        <div className="max-w-4xl mx-auto">
          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-cyan-500 via-fuchsia-500 to-indigo-500"></div>
            
            {/* Education items */}
            <div className="space-y-20">
              {educationItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.2 }}
                  className={`relative flex flex-col md:flex-row ${
                    index % 2 === 0 ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 w-10 h-10 rounded-full border-4 border-slate-900 bg-indigo-600 shadow-lg shadow-indigo-500/50 z-10">
                    <div className="absolute inset-0 rounded-full animate-ping bg-indigo-400 opacity-30"></div>
                  </div>
                  
                  {/* Content */}
                  <div className={`w-full md:w-1/2 ${
                    index % 2 === 0 ? 'md:pr-16 pl-12 md:pl-0' : 'md:pl-16 pl-12'
                  }`}>
                    <div className="holographic p-6 rounded-lg hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-500">
                      <div className="flex items-center mb-4">
                        <div className="mr-4">{item.icon}</div>
                        <div>
                          <h3 className="text-xl font-bold">{item.degree}</h3>
                          <p className="text-gray-400">{item.duration}</p>
                        </div>
                      </div>
                      
                      <h4 className="text-lg font-semibold mb-2 text-gradient">{item.institution}</h4>
                      <p className="text-gray-300">{item.description}</p>
                      {item.subjects && item.subjects.length > 0 && (
                        <ul className="mt-4 space-y-2">
                          {item.subjects.map((subject, i) => (
                            <li
                              key={i}
                              className="relative pl-6 text-gray-200/90 hover:text-white transition-colors duration-200"
                            >
                              <span className="absolute left-0 top-1 w-3 h-3">
                                <span className="absolute inset-0 rounded-full bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                                <span className="absolute inset-0 rounded-full bg-indigo-400 opacity-40 animate-ping"></span>
                              </span>
                              {subject}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Education;
