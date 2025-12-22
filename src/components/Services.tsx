import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import ServiceCard from "./ServiceCard";
import { Package, FileText, Sparkles, Zap } from "lucide-react";

const Services = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const services = [
    {
      icon: FileText,
      title: "Digital Publishing Services",
      description: "Seamless digital-first editorial and data services to publish faster and smarter.",
      items: [
        "Art & Design services",
        "Typesetting & Page Layout",
        "Digital & Conversion",
        "Data services",
        "Alt-Text Writing",
        "Cover page design",
        "Data Conversion",
      ],
      cta: "Explore Publishing Services",
      gradient: "from-accent to-secondary",
    },
    {
      icon: Package,
      title: "Premedia Services",
      description: "Accurate, print-ready artwork and production-ready packaging solutions that reduce time-to-press and minimize rework.",
      items: [
        "Packaging",
        "Image Production",
        "CGI & 3D rendering",
      ],
      cta: "View More",
      gradient: "from-primary to-accent",
    },
  ];

  return (
    <section id="services" ref={ref} className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.05 }}
          >
            <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              What We Offer
            </span>
            <Sparkles className="w-5 h-5 text-accent animate-pulse" style={{ animationDelay: '0.5s' }} />
          </motion.div>
          <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 bg-gradient-to-r from-foreground via-primary/80 to-foreground bg-clip-text text-transparent leading-tight">
            Our Services
          </h2>
          <motion.p
            className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Comprehensive creative solutions engineered to deliver <span className="text-primary font-semibold">measurable results</span>. 
            From digital publishing to premedia services, we bring <span className="text-accent font-semibold">precision and excellence</span> to every project.
          </motion.p>
        </motion.div>

        {/* Services Cards Grid */}
        <div className="grid lg:grid-cols-2 gap-12 mb-20">
          {services.map((service, index) => (
            <ServiceCard
              key={index}
              {...service}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-secondary/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500" />
            <div className="relative inline-block p-10 rounded-3xl bg-gradient-to-br from-card via-card to-card/80 border-2 border-primary/30 backdrop-blur-sm shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="text-left flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">
                    Need a custom solution?
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    We're here to help! Let's discuss your project and create something amazing together.
                  </p>
                </div>
                <motion.a
                  href="#contact"
                  className="flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-primary via-accent to-secondary text-white font-bold text-lg hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 group/btn whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => {
                    e.preventDefault();
                    document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Sparkles className="w-6 h-6 group-hover/btn:rotate-12 transition-transform duration-300" />
                  Get Started Today
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    →
                  </motion.span>
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
