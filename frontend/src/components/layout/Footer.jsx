import { Link } from 'react-router-dom'
import { Utensils, Instagram, Twitter, Facebook, Youtube, Mail, ArrowRight } from 'lucide-react'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-bg-card border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl orange-gradient flex items-center justify-center shadow-orange">
                <Utensils size={18} className="text-white" />
              </div>
              <span className="text-xl font-black">Meal<span className="gradient-text">Matrix</span></span>
            </Link>
            <p className="text-gray-muted text-sm leading-relaxed mb-6">
              Smart subscription-based meal delivery that adapts to your lifestyle. Fresh, nutritious, and delicious meals delivered daily.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Instagram size={18} />, href: '#', label: 'Instagram' },
                { icon: <Twitter size={18} />, href: '#', label: 'Twitter' },
                { icon: <Facebook size={18} />, href: '#', label: 'Facebook' },
                { icon: <Youtube size={18} />, href: '#', label: 'YouTube' },
              ].map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-bg-secondary hover:bg-accent/20 hover:text-accent text-gray-muted flex items-center justify-center transition-all"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/restaurants', label: 'Restaurants' },
                { to: '/meal-plans', label: 'Meal Plans' },
                { to: '/membership', label: 'Membership' },
                { to: '/orders', label: 'Track Orders' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-muted hover:text-accent text-sm transition-colors flex items-center gap-1.5 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5">
              {[
                'Help Center',
                'Contact Us',
                'Privacy Policy',
                'Terms of Service',
                'Refund Policy',
              ].map(item => (
                <li key={item}>
                  <a href="#" className="text-gray-muted hover:text-accent text-sm transition-colors flex items-center gap-1.5 group">
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-white font-semibold mb-4">Stay Updated</h4>
            <p className="text-gray-muted text-sm mb-4">Get weekly meal deals and nutrition tips.</p>
            <div className="space-y-3">
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-muted" />
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="w-full bg-bg-secondary border border-gray-700 rounded-xl pl-9 pr-4 py-3 text-sm text-white placeholder-gray-muted focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <button className="w-full btn-primary text-sm py-3">Subscribe Now</button>
            </div>
            <div className="mt-6 p-4 bg-bg-secondary rounded-xl border border-gray-800">
              <p className="text-xs text-gray-muted">📍 MealMatrix HQ</p>
              <p className="text-xs text-gray-soft mt-1">Bangalore, Karnataka 560001</p>
              <p className="text-xs text-accent mt-1">support@mealmatrix.in</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-muted text-sm">
            © {year} MealMatrix. All rights reserved. Made with ❤️ in India.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-800 bg-bg-secondary px-3 py-1 rounded-full border border-gray-800">v2.0.0</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-gray-muted">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
