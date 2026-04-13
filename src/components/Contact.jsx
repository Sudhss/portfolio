import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Mail, Linkedin, Github, Send, Instagram, Youtube } from 'lucide-react';

const Contact = () => {
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false
  });
  
  const [sectionRef, sectionInView] = useInView({
    threshold: 0.5,
  });
  
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (inView && !hasAnimated) {
      setHasAnimated(true);
    }
  }, [inView, hasAnimated]);
  
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value
    });
    if (e.target.name === 'email') {
      if (!validateEmail(e.target.value)) {
        setEmailError('Please enter a valid email address.');
      } else {
        setEmailError('');
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formState.email)) {
      setEmailError('Please enter a valid email address.');
      return;
    }
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://formspree.io/f/manjgokj', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      });
      
      if (response.ok) {
        setIsSubmitting(false);
        setIsSubmitted(true);
        setFormState({
          name: '',
          email: '',
          message: ''
        });
        
        // Reset success message after 1 seconds
        setTimeout(() => {
          setIsSubmitted(false);
        }, 1000);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSubmitting(false);
      // Yaha pe error handling state daal dena
    }
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
            data-text="CONTACT" 
            className="glitch-text text-4xl md:text-5xl font-bold mb-8"
            style={{background: 'linear-gradient(to top, #9CA3AF, #D1D5DB, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}
          >
            CONTACT
          </h2>
          <div className="h-0.5 w-24 md:w-32 bg-gradient-to-r from-cyan-500 to-fuchsia-500 mx-auto mb-8"></div>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={hasAnimated ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="holographic p-8 rounded-lg"
          >
            <h3 className="text-2xl font-bold mb-6">Get In Touch</h3>
            
            <p className="text-gray-300 mb-8">
              Feel free to reach out for collaborations, opportunities, or just to say hello! I'm open 
              to discussing new projects and ideas.
            </p>
            
            <div className="space-y-6">
              <a 
                href="mailto:shuklasudhanshu2304005@gmail.com" 
                className="flex items-center gap-4 text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                <div className="p-3 bg-slate-800 rounded-lg">
                  <Mail className="w-6 h-6" />
                </div>
                <span>shuklasudhanshu2304005@gmail.com</span>
              </a>
              
              <a 
                href="https://github.com/Sudhanshu-shukl" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-center gap-4 text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                <div className="p-3 bg-slate-800 rounded-lg">
                  <Github className="w-6 h-6" />
                </div>
                <span>Sudhss</span>
              </a>
              
              <a 
                href="https://linkedin.com/in/Sudhss/" 
                target='_blank'
                className="flex items-center gap-4 text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                <div className="p-3 bg-slate-800 rounded-lg">
                  <Linkedin className="w-6 h-6" />
                </div>
                <span>Sudhss</span>
              </a>
              
              <a 
                href="https://instagram.com/sudh.sss" 
                target='_blank'
                className="flex items-center gap-4 text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                <div className="p-3 bg-slate-800 rounded-lg">
                  <Instagram className="w-6 h-6" />
                </div>
                <span>sudh.sss</span>
              </a>

              <a 
                href="https://www.youtube.com/channel/UCDJvfrnOpYxnVdWuJpP-5Mw" 
                target='_blank'
                rel="noopener noreferrer"
                className="flex items-center gap-4 text-gray-300 hover:text-cyan-400 transition-colors duration-300"
              >
                <div className="p-3 bg-slate-800 rounded-lg">
                  <Youtube className="w-6 h-6" />
                </div>
                <span>YouTube Channel</span>
              </a>
            </div>
            
            <div className="mt-12 relative">
              <h4 className="text-xl font-semibold mb-3">Let's create something amazing together</h4>
              <p className="text-gray-400">Reach out and let's start a conversation</p>
              
              {/* Decorative element */}
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
            </div>
          </motion.div>
          
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={hasAnimated ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="holographic p-8 rounded-lg"
          >
            <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
            
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-500/20 border border-green-500/30 p-6 rounded-lg text-center"
              >
                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-xl font-bold mb-2 text-green-400">Message Sent!</h4>
                <p className="text-gray-300">Thank you for reaching out. I'll get back to you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    placeholder="Your email"
                    required
                    className={`w-full p-3 bg-slate-800/50 border ${emailError ? 'border-red-500' : 'border-slate-700'} rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300`}
                  />
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">{emailError}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-gray-300 mb-2">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formState.message}
                    onChange={handleChange}
                    placeholder="Your message"
                    required
                    rows="5"
                    className="w-full p-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-300"
                  ></textarea>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-lg text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 relative overflow-hidden group"
                >
                  <span className="absolute top-0 left-0 w-full h-full bg-white/10 transform -translate-x-full skew-x-12 group-hover:translate-x-0 transition-transform duration-700"></span>
                  
                  <span className="relative flex items-center justify-center">
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </span>
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;