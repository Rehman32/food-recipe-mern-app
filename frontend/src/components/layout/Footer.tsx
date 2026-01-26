import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Github, Twitter, Instagram, Mail } from 'lucide-react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        product: [
            { label: 'Browse Recipes', to: '/recipes' },
            { label: 'AI Suggestions', to: '/ai-suggestions' },
            { label: 'Smart Search', to: '/search' },
            { label: 'Activity Feed', to: '/feed' },
            { label: 'Add Recipe', to: '/add-recipe' },
            { label: 'Meal Planner', to: '/meal-planner' },
            { label: 'Collections', to: '/collections' },
        ],
        company: [
            { label: 'About Us', to: '/about' },
            { label: 'Contact', to: '/contact' },
            { label: 'Careers', to: '/careers' },
            { label: 'Blog', to: '/blog' },
        ],
        legal: [
            { label: 'Privacy Policy', to: '/privacy' },
            { label: 'Terms of Service', to: '/terms' },
            { label: 'Cookie Policy', to: '/cookies' },
        ],
    };

    const socialLinks = [
        { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
        { icon: Github, href: 'https://github.com', label: 'GitHub' },
        { icon: Mail, href: 'mailto:hello@recipehub.com', label: 'Email' },
    ];

    return (
        <footer className="bg-surface-50 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-800">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                                <ChefHat className="w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold font-display text-surface-900 dark:text-white">
                                RecipeHub
                            </span>
                        </Link>
                        <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
                            Discover, create, and share delicious recipes with a community of food lovers.
                        </p>
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-lg text-surface-500 hover:text-primary-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Product</h3>
                        <ul className="space-y-2">
                            {footerLinks.product.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white mb-4">Legal</h3>
                        <ul className="space-y-2">
                            {footerLinks.legal.map((link) => (
                                <li key={link.to}>
                                    <Link
                                        to={link.to}
                                        className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-12 pt-8 border-t border-surface-200 dark:border-surface-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-surface-500">
                        © {currentYear} RecipeHub. All rights reserved.
                    </p>
                    <p className="text-sm text-surface-500">
                        Made with ❤️ for food lovers
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
