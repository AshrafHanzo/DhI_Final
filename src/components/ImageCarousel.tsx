import { motion } from "framer-motion";

const ImageCarousel = () => {
  const images = [
    "/carousel/01.png",
    "/carousel/02.png",
    "/carousel/03.png",
    "/carousel/04.png",
    "/carousel/05.png",
    "/carousel/06.png",
    "/carousel/07.png",
    "/carousel/08.png",
  ];

  return (
    <section className="relative -mt-8 overflow-hidden bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Stunning top border with glow effect */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-accent to-secondary shadow-[0_0_20px_rgba(212,160,23,0.5)]"></div>
      
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 right-10 w-64 h-64 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      
      <div className="relative py-16">
        {/* Section title */}
        <div className="text-center mb-10">
          <motion.h2
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Our Work Showcase
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore our stunning portfolio of creative projects
          </motion.p>
        </div>
        
        <div className="overflow-hidden">
          <motion.div
            className="flex gap-6"
            animate={{
              x: [0, -3280],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 45,
                ease: "linear",
              },
            }}
          >
            {/* Duplicate images for seamless infinite loop */}
            {[...images, ...images, ...images, ...images].map((img, idx) => (
              <motion.div
                key={idx}
                className="flex-shrink-0 w-[400px] h-[280px] rounded-2xl overflow-hidden shadow-2xl hover:shadow-[0_10px_40px_rgba(212,160,23,0.4)] transition-all duration-500 relative group"
                whileHover={{ scale: 1.05, y: -10 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {/* Gradient border effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary via-accent to-secondary rounded-2xl opacity-0 group-hover:opacity-75 blur-sm transition-all duration-500"></div>
                
                {/* Image container */}
                <div className="relative w-full h-full bg-gradient-to-br from-muted to-background rounded-2xl overflow-hidden">
                  <img
                    src={img}
                    alt={`Showcase ${(idx % images.length) + 1}`}
                    className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white text-sm font-semibold">Project {(idx % images.length) + 1}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
      
      {/* Stunning bottom border with glow effect */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-secondary via-accent to-primary shadow-[0_0_20px_rgba(212,160,23,0.5)]"></div>
    </section>
  );
};

export default ImageCarousel;
