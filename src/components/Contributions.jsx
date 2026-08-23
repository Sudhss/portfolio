import React from 'react';
import { Code, Youtube, Paperclip, Route } from 'lucide-react';

const contributions = [
    {
        title: 'Company Wise LeetCode Problems',
        description: 'A collection of LeetCode problems organized by company, designed to help developers prepare for technical interviews at top-tier companies. Features curated problem sets from 40+ leading tech companies to enable focused and efficient interview preparation.',
        link: 'https://github.com/Sudhanshu-shukl/Company-Wise-LeetCode-Problems',
        icon: Code,
        companies: [
            'Amazon', 'Apple', 'Autodesk', 'Goldman Sachs', 'Google', 'Meta', 'Microsoft', 'Netflix',
            'Nvidia', 'and 30+'
        ]
    },
    {
        title: 'DSA & Low-Level Programming Tutorials',
        description: 'Educational YouTube channel dedicated to teaching Data Structures & Algorithms, system programming, and low-level concepts. Features comprehensive tutorials, coding walkthroughs, and problem-solving strategies to help developers master fundamental computer science concepts.',
        link: 'https://www.youtube.com/channel/UCDJvfrnOpYxnVdWuJpP-5Mw',
        icon: Youtube,
        topics: [
            'Data Structures', 'Algorithms', 'System Programming', 'Memory Management', 'C/C++', 'Problem Solving'
        ]
    },
    {
        title: 'Professional Resume Template',
        description: 'A clean, modern, and ATS-friendly resume template designed for developers and tech professionals. Features optimized formatting, professional styling, and comprehensive sections to help job seekers create standout resumes that pass through applicant tracking systems.',
        link: 'https://docs.google.com/document/d/1dNqwYXKRNK7tn2BxECBUKymcS9OBEfkh/edit?usp=sharing&ouid=110849747074630112692&rtpof=true&sd=true',
        icon: Paperclip,
        features: [
            'ATS Score 90%', 'Developer Focused', 'Easy to Customize', 'Professional Layout', 'Multiple Formats'
        ]
    },
    {
        title: 'FAANG-Ready Roadmap',
        description: 'A structured roadmap to go from 2nd-year fundamentals to FAANG-ready software engineering. Covers programming foundations, DSA, competitive programming, CS fundamentals, resume building, internships, system design, and high-impact projects.',
        link: 'https://drive.google.com/file/d/1tIRzrBOchXwopHkSzDiRiJSNIjlLNjEG/view?usp=sharing',
        icon: Route,
        features: ['Step-by-Step Path','DSA & CP', 'CS Fundamentals','Projects & Resume','System Design']
    }
];

const Contributions = () => {
    return (
        <section id="contributions" className="py-20 px-4 max-w-sm md:max-w-4xl mx-auto">
            <div className="text-center mb-16">
                <h2
                    data-text="CONTRIBUTIONS"
                    className="glitch-text text-4xl md:text-5xl font-bold mb-8"
                    style={{ background: 'linear-gradient(to top, #9CA3AF, #D1D5DB, #FFFFFF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
                >
                    CONTRIBUTIONS
                </h2>
                <div className="h-0.5 w-24 md:w-32 bg-gradient-to-r from-cyan-500 to-fuchsia-500 mx-auto mb-8"></div>
            </div>
            <p className="text-sm md:text-base lg:text-lg text-gray-300 mb-6 md:mb-8 text-center">Small contributions to the tech community for beginners — because real progress isn't about how high you rise, but how gently you hold the world while doing it.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {contributions.map((item, idx) => (
                    <a
                        key={idx}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative bg-slate-800/60 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden hover:border-cyan-400/30 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/20"
                    >
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        {/* Header with Icon */}
                        <div className="relative p-6 pb-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-xl border border-cyan-400/20 group-hover:border-cyan-400/40 transition-all duration-300">
                                    <item.icon className="w-6 h-6 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                                        {item.title}
                                    </h3>
                                </div>
                            </div>

                            <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-3">
                                {item.description}
                            </p>
                        </div>

                        {/* Tags Section */}
                        <div className="relative px-6 pb-6">
                            {item.companies && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Companies</h4>
                                    <div className="flex flex-nowrap gap-2">
                                        {item.companies.slice(0, 4).map((company, companyIdx) => (
                                            <span key={companyIdx} className="px-3 py-1 bg-slate-700/60 text-xs rounded-full text-gray-300 border border-slate-600/30 hover:border-cyan-400/30 transition-colors">
                                                {company}
                                            </span>
                                        ))}
                                        {item.companies.length > 4 && (
                                            <span className="px-3 py-1 bg-slate-700/60 text-xs rounded-full text-gray-400 border border-slate-600/30">
                                                +{item.companies.length - 4} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {item.topics && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Topics</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {item.topics.slice(0, 3).map((topic, topicIdx) => (
                                            <span key={topicIdx} className="px-3 py-1 bg-slate-700/60 text-xs rounded-full text-gray-300 border border-slate-600/30 hover:border-cyan-400/30 transition-colors">
                                                {topic}
                                            </span>
                                        ))}
                                        {item.topics.length > 3 && (
                                            <span className="px-3 py-1 bg-slate-700/60 text-xs rounded-full text-gray-400 border border-slate-600/30">
                                                +{item.topics.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {item.features && (
                                <div className="mb-4">
                                    <h4 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Features</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {item.features.slice(0, 3).map((feature, featureIdx) => (
                                            <span key={featureIdx} className="px-3 py-1 bg-slate-700/60 text-xs rounded-full text-gray-300 border border-slate-600/30 hover:border-cyan-400/30 transition-colors">
                                                {feature}
                                            </span>
                                        ))}
                                        {item.features.length > 3 && (
                                            <span className="px-3 py-1 bg-slate-700/60 text-xs rounded-full text-gray-400 border border-slate-600/30">
                                                +{item.features.length - 3} more
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* View Link */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <span className="text-xs text-gray-400">Click to view</span>
                                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                                    <svg className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-xl"></div>
                        <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-xl"></div>
                    </a>
                ))}
            </div>
        </section>
    );
};

export default Contributions;
