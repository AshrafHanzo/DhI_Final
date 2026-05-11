import { Linkedin, Instagram, Youtube, Mail, Phone, MapPin, ArrowUp, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoIcon from "@/assets/logo-icon-new.png";
import logoFull from "@/assets/logo-full-new.png";
import dhiLogoTransparent from "@/assets/dhi-logo-transparent.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: "Services", href: "#services" },
    { name: "Portfolio", href: "/illustrations", isExternal: true },
    { name: "Our Story", href: "#our-story" },
    { name: "Contact", href: "#contact" },
  ];

  const services = [
    { name: "Digital Publishing", href: "/digital-publishing", isExternal: true },
    { name: "Premedia Services", href: "/premedia-services", isExternal: true },
    { name: "Image Production", href: "/premedia-services", isExternal: true },
    { name: "CGI & 3D Rendering", href: "/premedia-services", isExternal: true },
  ];

  return (
    <footer className="relative text-white overflow-hidden">
      {/* Background Image Layer */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            backgroundImage: `url('/footer/WhatsApp Image 2025-11-27 at 6.02.45 PM copy.jpeg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        />
        {/* Dark overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50" />
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          className="fixed bottom-8 right-8 z-50 p-4 bg-gradient-to-br from-[#26a69a] to-[#1a7a6e] rounded-full shadow-2xl hover:shadow-[#26a69a]/50 transition-all duration-300"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1, rotate: 360 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6 text-white" />
        </motion.button>
      )}

      <div className="container mx-auto max-w-7xl relative z-10 px-4 py-16">
        {/* Top Section */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={dhiLogoTransparent}
                alt="DHI Creative Services Logo"
                className="w-full max-w-xs h-auto mb-6 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]"
              />
              <p className="text-white text-sm leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
                Your trusted partner for creative excellence, precision output, and seamless delivery.
              </p>
            </motion.div>
          </div>

          {/* Quick Links Column */}
          <div>
            <motion.h3
              className="text-xl font-bold mb-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Quick Links
            </motion.h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <motion.li
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <motion.a
                    href={link.href}
                    className="text-white hover:text-[#26a69a] transition-all duration-300 inline-flex items-center gap-2 group cursor-pointer drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                    whileHover={{ x: 5 }}
                    onClick={(e) => {
                      e.preventDefault();

                      // If it's an external link (route), navigate to it
                      if (link.isExternal) {
                        navigate(link.href);
                        return;
                      }

                      // If we're not on the home page, navigate there first
                      if (location.pathname !== "/") {
                        navigate("/");
                        setTimeout(() => {
                          document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                        }, 300);
                      } else {
                        document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <span className="w-1.5 h-1.5 bg-white rounded-full group-hover:w-3 transition-all duration-300" />
                    {link.name}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Services Column */}
          <div>
            <motion.h3
              className="text-xl font-bold mb-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Our Services
            </motion.h3>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <motion.li
                  key={service.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <motion.a
                    href={service.href}
                    className="text-white hover:text-[#26a69a] transition-all duration-300 inline-flex items-center gap-2 group drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                    whileHover={{ x: 5 }}
                    onClick={(e) => {
                      if (service.isExternal) {
                        e.preventDefault();
                        window.location.href = service.href;
                      } else {
                        e.preventDefault();
                        document.querySelector(service.href)?.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                  >
                    <span className="w-1.5 h-1.5 bg-white rounded-full group-hover:w-3 transition-all duration-300" />
                    {service.name}
                  </motion.a>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact Column */}
          <div className="-ml-4">
            <motion.h3
              className="text-xl font-bold mb-6 text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Get In Touch
            </motion.h3>
            <div className="space-y-4">
              <motion.a
                href="tel:+918056092982"
                className="flex items-start gap-3 text-white hover:text-[#26a69a] transition-colors group cursor-pointer drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Phone className="w-5 h-5 text-white mt-0.5 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                <span className="text-sm">+91 80560 92982</span>
              </motion.a>
              <motion.a
                href="mailto:selvaraj.veilumuthu@dhicreativeservices.com"
                className="flex items-start gap-3 text-white hover:text-[#26a69a] transition-colors group cursor-pointer drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Mail className="w-5 h-5 text-white mt-0.5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                <span className="text-sm whitespace-nowrap">selvaraj.veilumuthu@dhicreativeservices.com</span>
              </motion.a>
              <motion.a
                href="https://maps.google.com/?q=The+WorkVilla+Arcade+Centre+110/1+Mahatma+Gandhi+Road+Nungambakkam+Chennai+600034"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 text-white hover:text-[#26a69a] transition-colors group cursor-pointer drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <MapPin className="w-5 h-5 text-white mt-0.5 group-hover:bounce transition-transform duration-300 flex-shrink-0 drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]" />
                <span className="text-sm">The WorkVilla, Arcade Centre,<br /> 3rd Floor,110/1, Mahatma Gandhi Road, Nungambakkam,<br />Chennai 600034</span>
              </motion.a>
            </div>

            {/* Social Links */}
            <motion.div
              className="flex gap-3 mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <motion.a
                href="https://www.linkedin.com/company/109900440/admin/dashboard/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/20 hover:bg-[#0A66C2] border border-white/30 hover:border-[#0A66C2] transition-all duration-300 group backdrop-blur-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                aria-label="LinkedIn"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Linkedin className="w-5 h-5 text-white group-hover:text-white transition-colors" />
              </motion.a>
              <motion.a
                href="https://www.instagram.com/dhicreativeservices/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/20 hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] border border-white/30 hover:border-transparent transition-all duration-300 group backdrop-blur-sm drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
                aria-label="Instagram"
                whileHover={{ scale: 1.1, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Instagram className="w-5 h-5 text-white group-hover:text-white transition-colors" />
              </motion.a>

            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          className="border-t border-white/10 pt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white text-center md:text-left drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              © {currentYear} <span className="text-white font-semibold">DHI Creative Services</span>. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.8)]">
              <a href="#" className="hover:text-[#26a69a] transition-colors">Privacy Policy</a>
              <span></span>

            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
