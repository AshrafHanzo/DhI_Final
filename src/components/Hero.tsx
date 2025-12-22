import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

const Hero = () => {
  const headlineText = "Creativity that delivers — on time, on brand, on purpose.";
  
  return (
    <section className="min-h-screen relative overflow-hidden flex items-center pt-16 md:pt-20 gradient-hero">
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-8 z-10"
          >
            <motion.h1
              className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.02,
                  }
                }
              }}
            >
              {headlineText.split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.5, ease: [0.22, 0.9, 0.16, 1] }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.h1>

            <motion.p
              className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Specialists in vector art and creative redrawing, delivering end-to-end premedia, packaging, imaging, CGI, and digital publishing services
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <Button
                size="lg"
                variant="default"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-glow hover:-translate-y-1 transition-all duration-300 btn-press group"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Contact Us
                <motion.span
                  className="inline-block ml-2"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 hover:-translate-y-1 transition-all duration-300 btn-press"
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
              >
                View Services
              </Button>
            </motion.div>

            <motion.p
              className="text-xs md:text-sm text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              Fast turnaround · Dedicated account manager · Transparent pricing
            </motion.p>
          </motion.div>

          {/* Right Column - Video Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative h-[300px] sm:h-[400px] md:h-[600px] flex items-center justify-center mt-8 lg:mt-0"
          >
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl">
              {/* Gradient Border Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-primary via-accent to-primary rounded-3xl opacity-75 blur-lg animate-pulse"></div>
              
              {/* Video Container */}
              <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain"
                >
                  <source src="/IMG_0799.MOV" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        onClick={() => document.getElementById('intro')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider hidden sm:block">Scroll</span>
          <ArrowDown className="w-6 h-6 text-primary animate-bounce-subtle" />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
