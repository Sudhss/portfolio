import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Calendar, MapPin, Building } from 'lucide-react';

const Experience = ({ theme }) => {
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
    const event = new CustomEvent('sectionInView', { detail: 'experience' });
    window.dispatchEvent(event);
  }, [sectionInView]);

  const experiences = [
    {
      logo: (
        <div className="rounded-full bg-gradient-to-r flex items-center justify-center">
          <img src="Scholar.png" className="w-12 h-12 " />
        </div>
      ),
      title: "Frontend Developer Intern",
      company: "ScholarRank AI",
      companyUrl: "https://www.scholarrank.com/",
      type: "Internship",
      duration: "Jul 2025 – Sept 2025",
      timeSpan: "3 mos",
      location: "Noida, Uttar Pradesh, India",
      workType: "Remote",
      intro: "Key contributions during the internship:",
      responsibilities: [
        "Designed end-to-end system architecture for applicant intake platform handling 10K–20K applicants/ cycle, proposing RabbitMQ as async buffer between submission and ATS scoring — adopted by senior engineers in final build",
        "Built full applicant portal in Next.js owning frontend and backend, including 10 + form fields, API routes, and DB integration with latency target < 2s under load",
        "Architected HR - facing internal server separated from public ingress, with DB read replicas and automated GMail API integration for accept / reject notifications" ],
      closing: "Yes, these does sound like more of a System/Backend dev work, but it was a startup and i voluntarily worked on the complete project end-to-end Project Link : https://campus.ashna.ai/",
      skills: ["Tailwind CSS", "ReactJS", "NextJS"]
    },
{
  logo: (
    <div className="rounded-lg flex items-center justify-center">
      <img src="Infera.jpg" className="w-12 h-12 rounded-2xl" />
    </div>
  ),
    title: "SDE Intern",
      company: "Infera AI Labs",
        type: "Internship",
          duration: "Apr 2025 - Jun 2025",
            timeSpan: "3 mos",
              location: "Delhi, India",
                workType: "Hybrid",
                  intro: "Friend's startup (not an official company), so it's not on my resume — but I count it as work experience because I genuinely worked there.",
                    responsibilities: [
                      "Built the frontend, backend, and probably part of the internet in the process",
                      "Designed UIs, wrote APIs, managed databases, and silently panicked through deployments",
                      "Wore every dev hat possible—frontend guy, backend guy, DevOps guy, therapist",
                      "Stack? ReactJS, Node.js, MongoDB, duct tape, and sheer willpower"
                    ],
                      closing: "Still waiting for someone to tell me what my role actually was.",
                        skills: ["Cassandra", "Tailwind CSS", "ReactJS", "Node.js", "MongoDB"]
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
          data-text="EXPERIENCE"
          className="glitch-text text-4xl md:text-5xl font-bold mb-8"
          style={{ background: 'linear-gradient(to top, #9CA3AF, #D1D5DB, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
        >
          EXPERIENCE
        </h2>
        <div className="h-0.5 w-24 md:w-32 bg-gradient-to-r from-cyan-500 to-fuchsia-500 mx-auto mb-8"></div>
      </motion.div>

      <div className="max-w-4xl mx-auto space-y-8">
        {experiences.map((experience, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={hasAnimated ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 * index }}
            className="holographic p-8 rounded-xl relative overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                {experience.logo}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-white">{experience.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Building className="w-4 h-4" />
                    {experience.companyUrl ? (
                      <a
                        href={experience.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {experience.company}
                      </a>
                    ) : (
                      <span>{experience.company}</span>
                    )}
                    <span>·</span>
                    <span>{experience.type}</span>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center gap-4 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{experience.duration}</span>
                    <span>·</span>
                    <span>{experience.timeSpan}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{experience.location}</span>
                    <span>·</span>
                    <span>{experience.workType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="text-gray-300 italic">"{experience.intro}"</p>

              <ul className="space-y-2">
                {experience.responsibilities.map((responsibility, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <span className="text-cyan-400 mt-1">•</span>
                    <span>{responsibility}</span>
                  </li>
                ))}
              </ul>

              <p className="text-gray-300 italic">"{experience.closing}"</p>

              {/* Skills */}
              <div className="flex flex-wrap gap-2 pt-4">
                {experience.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 text-xs rounded-full bg-slate-800/50 border border-white/10 text-gray-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
};

export default Experience; 