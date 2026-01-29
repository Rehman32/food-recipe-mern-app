import React from 'react';
import { Link } from 'react-router-dom';
import {
    Code, Smartphone, Brain, Globe, Sparkles,
    Github, Mail, ArrowRight, Users, Target, Lightbulb,
} from 'lucide-react';

const SERVICES = [
    {
        icon: Globe,
        title: 'Web Applications',
        desc: 'Full-stack web apps with React, Node.js, and modern cloud infrastructure.',
        color: 'from-blue-500 to-cyan-500',
    },
    {
        icon: Smartphone,
        title: 'Mobile Applications',
        desc: 'Cross-platform mobile apps for iOS and Android with React Native and Flutter.',
        color: 'from-purple-500 to-pink-500',
    },
    {
        icon: Brain,
        title: 'AI & Machine Learning',
        desc: 'Intelligent solutions with NLP, computer vision, recommendation engines, and predictive analytics.',
        color: 'from-orange-500 to-red-500',
    },
    {
        icon: Code,
        title: 'Custom Software',
        desc: 'Bespoke enterprise software, APIs, microservices, and system integrations.',
        color: 'from-green-500 to-emerald-500',
    },
];

const TEAM_VALUES = [
    { icon: Target, title: 'Mission', desc: 'Building software that solves real problems and helps businesses grow.' },
    { icon: Lightbulb, title: 'Innovation', desc: 'We use cutting-edge technology to deliver future-proof digital solutions.' },
    { icon: Users, title: 'Collaboration', desc: 'Working closely with clients to understand their vision and deliver beyond expectations.' },
];

const AboutPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 25% 25%, #f97316 0%, transparent 50%), radial-gradient(circle at 75% 75%, #ec4899 0%, transparent 50%)',
                }} />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
                            <Sparkles className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-medium text-orange-300">About FlavorAI</span>
                        </div>
                        <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                            Built by <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">SharpLogix Solutions</span>
                        </h1>
                        <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                            We are a software company providing innovative solutions across the digital landscape — from web and mobile applications to AI & machine learning systems. FlavorAI is our showcase of what modern technology can do for everyday life.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <a
                                href="https://github.com/Rehman32"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
                            >
                                <Github className="w-5 h-5" /> View on GitHub
                            </a>
                            <a
                                href="mailto:sharplogix.solutions.32@gmail.com"
                                className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/20 text-white px-6 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all"
                            >
                                <Mail className="w-5 h-5" /> Contact Us
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* About FlavorAI */}
            <section className="py-16 bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">What is FlavorAI?</h2>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                                FlavorAI is an AI-powered recipe platform that helps you discover, cook, and plan meals with real nutrition data. With access to over 500,000 recipes, smart diet filters, calorie tracking, and AI-generated meal plans, it transforms how you approach food.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                Whether you're following a keto diet, tracking protein intake, searching by ingredients in your fridge, or need a week-long meal plan — FlavorAI has you covered.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link to="/recipes" className="inline-flex items-center gap-1 text-orange-500 hover:text-orange-600 font-semibold text-sm">
                                    Explore Recipes <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/ai-suggestions" className="inline-flex items-center gap-1 text-purple-500 hover:text-purple-600 font-semibold text-sm">
                                    Try AI Chef <ArrowRight className="w-4 h-4" />
                                </Link>
                                <Link to="/nutrition" className="inline-flex items-center gap-1 text-green-500 hover:text-green-600 font-semibold text-sm">
                                    Nutrition Finder <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Recipes', value: '500K+', color: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' },
                                { label: 'Cuisines', value: '25+', color: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' },
                                { label: 'Diet Types', value: '10+', color: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' },
                                { label: 'Nutrients', value: '30+', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' },
                            ].map((stat) => (
                                <div key={stat.label} className={`rounded-2xl p-6 text-center ${stat.color}`}>
                                    <p className="text-3xl font-bold mb-1">{stat.value}</p>
                                    <p className="text-sm font-medium opacity-80">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Services */}
            <section className="py-16 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Services</h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            SharpLogix Solutions delivers end-to-end software solutions for businesses of all sizes.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {SERVICES.map((service) => (
                            <div
                                key={service.title}
                                className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                                    <service.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-2">{service.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{service.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-16 bg-white dark:bg-gray-950">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Our Values</h2>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {TEAM_VALUES.map((val) => (
                            <div key={val.title} className="text-center">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-4">
                                    <val.icon className="w-7 h-7 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{val.title}</h3>
                                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{val.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 bg-gradient-to-r from-orange-500 to-red-600 text-white">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-4">Have a Project in Mind?</h2>
                    <p className="text-white/80 mb-8 max-w-2xl mx-auto">
                        Whether you need a web app, mobile app, or AI solution — we'd love to hear from you.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <a
                            href="mailto:sharplogix.solutions.32@gmail.com"
                            className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all shadow-lg"
                        >
                            <Mail className="w-5 h-5" /> Get in Touch
                        </a>
                        <Link
                            to="/contact"
                            className="inline-flex items-center gap-2 bg-white/10 border-2 border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/20 transition-all"
                        >
                            Contact Form <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default AboutPage;
