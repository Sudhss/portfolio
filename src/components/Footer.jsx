import React from 'react';
import { motion } from 'framer-motion';
import { Github, Linkedin, Mail, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-slate-950 pt-16 pb-6">
      {/* Background gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent"></div>
        <div className="absolute top-0 left-5 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl -z-10"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-gradient mb-4"
          >
            Sudhanshu Shukla
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-400 max-w-md mx-auto"
          >
            Systems and Backend Engineer | Problem Solver | 6+ years of coding
          </motion.p>
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex justify-center space-x-6 mb-10"
        >
          <a 
            href="https://github.com/Sudhss" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors duration-300"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          
          <a 
            href="https://linkedin.com/in/Sudhss/" 
            className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors duration-300"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
          
          <a 
            href="https://instagram.com/sudh.sss" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors duration-300"
            aria-label="Instagram"
          >
            <Instagram className="w-5 h-5" />
          </a>

          <a 
            href="https://www.youtube.com/channel/UCDJvfrnOpYxnVdWuJpP-5Mw" 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors duration-300"
            aria-label="YouTube"
          >
            <Youtube className="w-5 h-5" />
          </a>
          
          <a 
            href="mailto:shuklasudhanshu2304005@gmail.com"
            className="p-3 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors duration-300"
            aria-label="Email"
          >
            <Mail className="w-5 h-5" />
          </a>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-gray-500 text-sm"
        >
          <p>Sudhanshu Shukla <br/>Where your expections peak, My performence starts</p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;