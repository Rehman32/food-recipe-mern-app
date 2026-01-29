import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Github, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Browse Recipes', to: '/recipes' },
            { label: 'AI Chef', to: '/ai-suggestions' },
            { label: 'Smart Search', to: '/search' },
            { label: 'Nutrition Finder', to: '/nutrition' },
            { label: 'Meal Planner', to: '/meal-planner' },
            { label: 'Activity Feed', to: '/feed' },
            { label: 'Collections', to: '/collections' },
        ],
        company: [
            { label: 'About Us', to: '/about' },
            { label: 'Contact', to: '/contact' },
        ],
        legal: [
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
        ],
    };

    const socialLinks = [
        { icon: Github, href: 'https://github.com/Rehman32', label: 'GitHub' },
        { icon: Mail, href: 'mailto:sharplogix.solutions.32@gmail.com', label: 'Email' },
    ];

    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
                                <ChefHat className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                FlavorAI
                            </span>
                        </Link>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            AI-powered recipe discovery with real nutrition data, smart diet filters, and intelligent meal planning.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h3>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 mt-6">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Get in Touch</h3>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href="mailto:sharplogix.solutions.32@gmail.com"
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                >
                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                    sharplogix.solutions.32@gmail.com
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://github.com/Rehman32"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
                                >
                                    <Github className="w-4 h-4 flex-shrink-0" />
                                    github.com/Rehman32
                                </a>
                            </li>
                        </ul>
                        <div className="mt-6 p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-100 dark:border-orange-800/30">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">Built by SharpLogix Solutions</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Web Apps · Mobile Apps · AI/ML</p>
                        </div>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500">
                        © {currentYear} FlavorAI by SharpLogix Solutions. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-500">
                        Powered by Spoonacular · Made with ❤️
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
