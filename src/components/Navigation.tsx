import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Menu, X, LogIn } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "@/assets/logo.png";
import EmployeeLoginModal from "./EmployeeLoginModal";
import { getEmployeePortalUrl } from "@/lib/config";

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isEmployeeLoginOpen, setIsEmployeeLoginOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/", isExternal: true },
    { name: "Services", href: "#services" },
    { name: "Portfolio", href: "/illustrations", isExternal: true },
    { name: "Our Story", href: "#our-story" },
    { name: "Contact", href: "#contact" },
  ];

  const handleNavClick = (e: React.MouseEvent, link: typeof navLinks[0]) => {
    e.preventDefault();

    // If it's Home button, navigate to homepage and scroll to top
    if (link.name === "Home") {
      navigate("/");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      return;
    }

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
  };

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 bg-white shadow-lg border-b border-primary/10"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            className="flex items-center gap-3 relative z-10 cursor-pointer"
          >
            <img
              src={logo}
              alt="DHI Creative Services - Precision. People. Progress."
              className="h-12 sm:h-14 md:h-16 drop-shadow-lg"
            />
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <motion.a
                key={link.name}
                href={link.href}
                className="relative text-foreground hover:text-primary transition-all duration-300 font-semibold text-[15px] group cursor-pointer"
                onClick={(e) => handleNavClick(e, link)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.5 }}
                whileHover={{ y: -2 }}
              >
                {link.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-accent group-hover:w-full transition-all duration-300" />
              </motion.a>
            ))}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Button
                variant="outline"
                className="relative border-2 border-primary/30 text-primary hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white hover:border-transparent transition-all duration-300 font-semibold shadow-md hover:shadow-xl hover:shadow-primary/30 overflow-hidden group"
                onClick={() => {
                  window.location.href = getEmployeePortalUrl();
                }}
                aria-label="Employee Login Portal"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <LogIn className="w-4 h-4 mr-2 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                <span className="relative z-10">Employee Login</span>
              </Button>
            </motion.div>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-xl hover:bg-primary/10 transition-colors duration-300 relative"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
            whileTap={{ scale: 0.9 }}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-primary" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="md:hidden bg-gradient-to-b from-background to-muted/20 border-t border-primary/20 backdrop-blur-xl"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="container mx-auto px-4 py-8 space-y-2">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  className="block text-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 font-semibold py-4 px-4 rounded-xl relative group cursor-pointer"
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    handleNavClick(e, link);
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <span className="flex items-center justify-between">
                    {link.name}
                    <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300">?</span>
                  </span>
                  <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="pt-4"
              >
                <Button
                  variant="outline"
                  className="w-full border-2 border-primary/30 text-primary hover:bg-gradient-to-r hover:from-primary hover:to-accent hover:text-white hover:border-transparent transition-all duration-300 font-semibold py-6 text-base shadow-lg"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.href = getEmployeePortalUrl();
                  }}
                >
                  <LogIn className="w-5 h-5 mr-2" />
                  Employee Login
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <EmployeeLoginModal
        isOpen={isEmployeeLoginOpen}
        onClose={() => setIsEmployeeLoginOpen(false)}
      />
    </motion.nav>
  );
};

export default Navigation;
