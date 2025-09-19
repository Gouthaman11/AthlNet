import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from 'components/AppIcon';

const Footer = () => {
  const navigate = useNavigate();
  const currentYear = new Date()?.getFullYear();

  const handleLogoClick = () => {
    navigate('/landing-page');
  };

  const handleLoginClick = () => {
    navigate('/user-login');
  };

  const handleSignUpClick = () => {
    navigate('/user-registration');
  };

  const footerLinks = {
    product: [
      { label: 'Features', href: '#features' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'API', href: '#api' },
      { label: 'Mobile App', href: '#mobile' }
    ],
    company: [
      { label: 'About Us', href: '#about' },
      { label: 'Careers', href: '#careers' },
      { label: 'Press', href: '#press' },
      { label: 'Blog', href: '#blog' }
    ],
    resources: [
      { label: 'Help Center', href: '#help' },
      { label: 'Community', href: '#community' },
      { label: 'Guides', href: '#guides' },
      { label: 'Success Stories', href: '#stories' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
      { label: 'GDPR', href: '#gdpr' }
    ]
  };

  const socialLinks = [
    { name: 'Twitter', icon: 'Twitter', href: '#twitter' },
    { name: 'Facebook', icon: 'Facebook', href: '#facebook' },
    { name: 'Instagram', icon: 'Instagram', href: '#instagram' },
    { name: 'LinkedIn', icon: 'Linkedin', href: '#linkedin' },
    { name: 'YouTube', icon: 'Youtube', href: '#youtube' }
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-4 space-y-6">
              <button
                onClick={handleLogoClick}
                className="flex items-center space-x-3 hover:opacity-80 transition-smooth"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary-foreground"
                  >
                    <path
                      d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <span className="text-2xl font-bold text-foreground">AthlNet</span>
              </button>
              
              <p className="text-muted-foreground leading-relaxed max-w-md">
                The premier social networking platform connecting athletes, coaches, sponsors, and fans worldwide. Build your sports career and discover endless opportunities.
              </p>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {socialLinks?.map((social) => (
                  <a
                    key={social?.name}
                    href={social?.href}
                    className="w-10 h-10 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white transition-smooth hover-scale"
                    aria-label={social?.name}
                  >
                    <Icon name={social?.icon} size={18} />
                  </a>
                ))}
              </div>

              {/* Newsletter Signup */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Stay Updated</h4>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-smooth">
                    <Icon name="Send" size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Links Sections */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {/* Product */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Product</h4>
                  <ul className="space-y-3">
                    {footerLinks?.product?.map((link) => (
                      <li key={link?.label}>
                        <a
                          href={link?.href}
                          className="text-muted-foreground hover:text-foreground transition-smooth text-sm"
                        >
                          {link?.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Company</h4>
                  <ul className="space-y-3">
                    {footerLinks?.company?.map((link) => (
                      <li key={link?.label}>
                        <a
                          href={link?.href}
                          className="text-muted-foreground hover:text-foreground transition-smooth text-sm"
                        >
                          {link?.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Resources</h4>
                  <ul className="space-y-3">
                    {footerLinks?.resources?.map((link) => (
                      <li key={link?.label}>
                        <a
                          href={link?.href}
                          className="text-muted-foreground hover:text-foreground transition-smooth text-sm"
                        >
                          {link?.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground">Legal</h4>
                  <ul className="space-y-3">
                    {footerLinks?.legal?.map((link) => (
                      <li key={link?.label}>
                        <a
                          href={link?.href}
                          className="text-muted-foreground hover:text-foreground transition-smooth text-sm"
                        >
                          {link?.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="py-8 border-t border-border">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>© {currentYear} AthlNet. All rights reserved.</span>
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={14} />
                <span>Made with ❤️ globally</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLoginClick}
                className="text-sm text-muted-foreground hover:text-foreground transition-smooth"
              >
                Sign In
              </button>
              <button
                onClick={handleSignUpClick}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 transition-smooth"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8 pt-8 border-t border-border opacity-60">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="Shield" size={14} />
              <span>SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="Award" size={14} />
              <span>ISO 27001 Certified</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="Users" size={14} />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="Clock" size={14} />
              <span>99.9% Uptime SLA</span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Icon name="Globe" size={14} />
              <span>Global CDN</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;