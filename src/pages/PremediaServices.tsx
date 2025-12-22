import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Package, Image as ImageIcon, Box, CheckCircle2, Layers, ChevronDown } from "lucide-react";
import { AnimatePresence } from "framer-motion";

const PremediaServices = () => {
  const [activeTab, setActiveTab] = useState("packaging");
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);
  const navigate = useNavigate();

  // Toggle accordion for mobile
  const toggleMobileAccordion = (serviceId: string) => {
    setExpandedMobile(expandedMobile === serviceId ? null : serviceId);
  };

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const services = [
    {
      id: "packaging",
      name: "Packaging",
      icon: Package,
      description: "Complete packaging solutions from concept to print-ready artwork",
      image: "/Premedia-Services/Packaging.png.jpg",
      features: [
        "Die-line Creation - Precision die-line development for all packaging types and specifications",
        "Master Artwork Creation - Develop comprehensive master artwork files for packaging production",
        "Range Extension & Mechanicals - Extend product ranges and create mechanical artwork variations",
        "Repro/Prepress - Professional reproduction and prepress services for print optimization",
        "Artwork Adaptation - Adapt existing artwork for different markets, sizes, and specifications",
        "Reprographics - High-quality reproduction services for packaging and print materials"
      ],
      benefits: [
        "Print-ready files with accuracy",
        "Fast turnaround on complex projects",
        "Compliance with industry standards",
        "Reduced production errors and costs"
      ]
    },
    {
      id: "image-production",
      name: "Image Production",
      icon: ImageIcon,
      description: "Professional image editing and enhancement for premium visual quality",
      image: "/Premedia-Services/Image-production.png.jpg",
      features: [
        "Clipping Path - Precise edge detection and background removal for product photography",
        "Masking - Advanced masking techniques for complex images and transparent objects",
        "Shadow Creation - Natural drop shadows, reflection shadows, and cast shadow effects",
        "Color Correction - Professional color adjustment for consistent, accurate results",
        "Creative Retouching - Expert photo retouching to enhance visual appeal and quality",
        "Subjective Color Correction - Artistic color grading to match brand aesthetics",
        "Compositing - Seamless image composition and photo manipulation services",
        "CT Process - Continuous tone processing for high-quality image reproduction"
      ],
      benefits: [
        "Studio-quality image enhancement",
        "Consistent color across all media",
        "Professional retouching services",
        "Fast batch processing capabilities"
      ]
    },
    {
      id: "cgi-3d",
      name: "CGI & 3D Rendering",
      icon: Box,
      description: "Cutting-edge 3D visualization and CGI for stunning product presentation",
      image: "/Premedia-Services/CGI&3D.png.jpg",
      features: [
        "2D and 3D Packshot Creations - Photorealistic product renderings from any angle",
        "Creative Designs for Print and Digital Media - Stunning 3D visuals for all marketing channels",
        "Camera Raw File Conversion - Professional RAW file processing and optimization"
      ],
      benefits: [
        "Photorealistic product visualization",
        "Cost-effective alternative to photography",
        "Unlimited angles and variations",
        "Perfect for pre-production marketing"
      ]
    }
  ];

  const activeService = services.find(s => s.id === activeTab) || services[0];

  const handleGetStarted = () => {
    navigate("/");
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-secondary/10 to-accent/10 border border-secondary/20">
              <Layers className="w-5 h-5 text-secondary" />
              <span className="text-sm font-semibold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">
                Premedia Excellence
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-secondary to-foreground bg-clip-text text-transparent">
              Premedia Services
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              Professional packaging, image production, and 3D rendering services for exceptional visual quality
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section with Sticky Sidebar */}
      <section className="py-12 px-4 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-40 right-0 w-[500px] h-[500px] bg-gradient-to-br from-secondary/10 to-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-40 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-primary/10 to-secondary/10 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Mobile Accordion Layout */}
          <div className="lg:hidden space-y-3">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
              >
                {/* Accordion Header */}
                <button
                  onClick={() => toggleMobileAccordion(service.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-4 rounded-xl font-medium transition-all duration-300 text-left border-2 ${expandedMobile === service.id
                    ? "bg-gradient-to-r from-secondary to-accent text-white border-transparent shadow-lg"
                    : "bg-card border-border/50 text-foreground hover:border-secondary/30"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-all duration-300 ${expandedMobile === service.id ? "bg-white/20" : "bg-muted"
                      }`}>
                      <service.icon className={`w-5 h-5 ${expandedMobile === service.id ? "text-white" : "text-secondary"
                        }`} />
                    </div>
                    <span className="font-semibold">{service.name}</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedMobile === service.id ? "rotate-180" : ""
                    } ${expandedMobile === service.id ? "text-white" : "text-muted-foreground"}`} />
                </button>

                {/* Accordion Content */}
                <AnimatePresence>
                  {expandedMobile === service.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 space-y-4">
                        {/* Image */}
                        <div className="rounded-xl overflow-hidden border-2 border-secondary/30">
                          <img
                            src={service.image}
                            alt={service.name}
                            className="w-full aspect-video object-cover"
                          />
                        </div>

                        {/* Description */}
                        <p className="text-sm text-muted-foreground px-1">
                          {service.description}
                        </p>

                        {/* Features */}
                        <div className="bg-card/50 rounded-xl border border-border/50 p-4">
                          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                            <div className="w-1 h-5 bg-gradient-to-b from-secondary to-accent rounded-full" />
                            Key Services
                          </h4>
                          <div className="space-y-2">
                            {service.features.map((feature, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                                <span className="text-foreground/90">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Benefits */}
                        <div className="bg-card/50 rounded-xl border border-border/50 p-4">
                          <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                            <div className="w-1 h-5 bg-gradient-to-b from-accent to-secondary rounded-full" />
                            Benefits
                          </h4>
                          <div className="grid grid-cols-1 gap-2">
                            {service.benefits.map((benefit, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-secondary/5">
                                <div className="w-1.5 h-1.5 rounded-full bg-secondary mt-1.5 flex-shrink-0" />
                                <span className="text-foreground">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* CTA Button */}
                        <Button
                          className="w-full bg-gradient-to-r from-secondary to-accent text-white"
                          onClick={handleGetStarted}
                        >
                          Get Started
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Desktop Layout */}
          <div className="hidden lg:flex flex-row gap-8">
            {/* Left: Sticky Navigation Tabs */}
            <div className="w-80 flex-shrink-0">
              <div className="sticky top-24">
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Navigation card background */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-secondary/30 via-accent/20 to-primary/30 rounded-3xl blur-lg opacity-60" />

                  <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border border-border/50 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-border/50 bg-gradient-to-r from-secondary/10 to-accent/10">
                      <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                        <Layers className="w-5 h-5 text-secondary" />
                        Our Services
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">Select a service to explore</p>
                    </div>

                    {/* Navigation Items */}
                    <div className="p-3 space-y-2">
                      {services.map((service, index) => (
                        <motion.button
                          key={service.id}
                          onClick={() => setActiveTab(service.id)}
                          className={`w-full flex items-center gap-3 px-4 py-4 rounded-xl font-medium transition-all duration-300 text-left group relative overflow-hidden ${activeTab === service.id
                            ? "text-white shadow-lg"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08, duration: 0.4 }}
                          whileHover={{ x: activeTab === service.id ? 0 : 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Active background */}
                          {activeTab === service.id && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-secondary to-accent"
                              layoutId="activeTabBgPremedia"
                              transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            />
                          )}

                          {/* Icon container */}
                          <div className={`relative z-10 p-2 rounded-lg transition-all duration-300 ${activeTab === service.id
                            ? "bg-white/20"
                            : "bg-muted group-hover:bg-secondary/10"
                            }`}>
                            <service.icon className={`w-5 h-5 transition-colors duration-300 ${activeTab === service.id ? "text-white" : "text-secondary"
                              }`} />
                          </div>

                          {/* Text */}
                          <span className="relative z-10 text-sm font-semibold leading-tight">
                            {service.name}
                          </span>

                          {/* Active indicator */}
                          {activeTab === service.id && (
                            <motion.div
                              className="absolute right-3 w-2 h-2 bg-white rounded-full"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.1 }}
                            />
                          )}
                        </motion.button>
                      ))}
                    </div>

                    {/* Footer decoration */}
                    <div className="p-4 border-t border-border/50 bg-gradient-to-r from-muted/50 to-muted/30">
                      <p className="text-xs text-muted-foreground text-center">
                        {services.length} services available
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Right: Content Area */}
            <div className="flex-1 min-w-0">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-8"
              >
                {/* Service Image Card */}
                <div className="relative rounded-2xl overflow-hidden border-2 border-secondary/30 shadow-xl group hover:border-secondary/60 transition-all duration-300">
                  {/* Full Image - Fits Box */}
                  <img
                    src={activeService.image}
                    alt={activeService.name}
                    className="w-full aspect-video object-cover"
                  />

                  {/* Overlay with title at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-secondary to-accent rounded-xl">
                        <activeService.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl md:text-2xl font-bold text-white">
                          {activeService.name}
                        </h2>
                        <p className="text-sm text-white/80">
                          {activeService.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Features Section - Compact Single Box */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-3xl blur-lg opacity-50" />
                  <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-6 overflow-hidden">
                    {/* Decorative background */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-secondary/10 to-transparent rounded-full blur-2xl" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-accent/10 to-transparent rounded-full blur-2xl" />

                    <h3 className="relative text-xl font-bold mb-5 text-foreground flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-secondary to-accent rounded-full" />
                      Key Services
                    </h3>

                    {/* Compact Grid Layout */}
                    <div className="relative grid sm:grid-cols-2 gap-3">
                      {activeService.features.map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-br from-background/80 to-background/40 border border-border/30 hover:border-secondary/40 hover:bg-background/90 transition-all duration-300 group"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-secondary group-hover:text-accent transition-colors" />
                          </div>
                          <span className="text-sm text-foreground/90 leading-relaxed">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Benefits Section */}
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-3xl blur-lg opacity-50" />
                  <div className="relative bg-card/50 backdrop-blur-sm rounded-2xl border border-border/50 p-8">
                    <h3 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-3">
                      <div className="w-1.5 h-10 bg-gradient-to-b from-accent to-secondary rounded-full" />
                      Benefits
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {activeService.benefits.map((benefit, index) => (
                        <motion.div
                          key={index}
                          className="p-5 rounded-xl bg-gradient-to-br from-secondary/10 to-accent/10 border border-secondary/20 hover:border-secondary/40 transition-all duration-300 group"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          whileHover={{ y: -2 }}
                        >
                          <div className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-secondary to-accent mt-2 flex-shrink-0" />
                            <p className="text-foreground font-medium">{benefit}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* CTA Section */}
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className="absolute -inset-2 bg-gradient-to-r from-secondary/30 via-accent/30 to-secondary/30 rounded-3xl blur-xl opacity-60" />
                  <div className="relative bg-gradient-to-r from-secondary/10 via-accent/10 to-secondary/10 rounded-2xl border border-secondary/20 p-8 text-center">
                    <h4 className="text-xl font-bold mb-3 text-foreground">Ready to get started?</h4>
                    <p className="text-muted-foreground mb-6">Let's discuss how we can help with your {activeService.name.toLowerCase()} needs.</p>
                    <Button
                      onClick={handleGetStarted}
                      size="lg"
                      className="bg-gradient-to-r from-secondary to-accent hover:from-secondary/90 hover:to-accent/90 text-white font-semibold px-10 py-6 text-lg shadow-lg hover:shadow-2xl hover:shadow-secondary/50 transition-all duration-300"
                    >
                      Get Started Today
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PremediaServices;
