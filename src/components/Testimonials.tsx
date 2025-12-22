import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Quote, Star, Sparkles, Award, Building2, Lightbulb, Users, Trophy } from "lucide-react";

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const testimonial = {
    quote: `Working with DHI Creative Services to develop the promotional illustrations for WorkBooster AI Solutions was an exceptional experience. As an AI automation startup, we needed visuals that could clearly and creatively convey the complex value of our services—something sophisticated yet easily understandable.

The DHI team didn't just execute a design brief; they took the time to truly understand our brand, our target audience, and the nuances of AI automation. The resulting illustrations are stunning, highly professional, and perfectly align with our company's innovative spirit.

Since implementing their designs across our promotional materials, we've received fantastic feedback from potential clients about the clarity and quality of our branding. DHI Creative Services is a top-tier partner for any startup looking to elevate their visual identity and effectively communicate their unique offering. Highly recommended!`,
    author: "Senthil Pitchai",
    position: "Founder & CEO, WorkBooster AI Solutions",
    credentials: [
      "Automating Repetitive Work",
      "Founder, THE BRAND AUTHORITY",
      "Creator of OutOfSyllabuss.org (Non-Profit)",
      "Transforming Students into Industry-Ready Talent"
    ],
    date: "December 4, 2025",
    relationship: "Senthil was Selvaraj's client",
    rating: 5,
  };

  return (
    <section ref={ref} className="py-24 px-4 relative overflow-hidden bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Stunning animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <motion.div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-primary/20 via-primary/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-gradient-to-tl from-secondary/20 via-secondary/10 to-transparent rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-accent/10 via-transparent to-transparent rounded-full"
          animate={{
            rotate: [0, 360],
          }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        />

        {/* Decorative shapes */}
        <div className="absolute top-20 right-20 w-32 h-32 border border-primary/20 rounded-full" />
        <div className="absolute bottom-20 left-20 w-24 h-24 border border-secondary/20 rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl rotate-45" />
      </div>

      {/* Floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.3, 0.7, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            <Sparkles className="w-4 h-4 text-secondary/40" />
          </motion.div>
        ))}
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Header Section */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-3 mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 border border-primary/20 shadow-lg shadow-primary/5"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Star className="w-5 h-5 text-secondary fill-secondary" />
            <span className="text-sm font-bold text-primary tracking-wide uppercase">Client Success Story</span>
            <Star className="w-5 h-5 text-secondary fill-secondary" />
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            What Our Clients Say
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real stories from brands we've helped transform through creative excellence
          </p>
        </motion.div>

        {/* Featured Testimonial Card */}
        <motion.div
          className="relative group"
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        >
          {/* Animated gradient border */}
          <div className="absolute -inset-[3px] bg-gradient-to-r from-primary via-secondary to-accent rounded-[2.5rem] opacity-60 blur-sm group-hover:opacity-80 transition-opacity duration-500" />
          <div className="absolute -inset-[2px] bg-gradient-to-r from-primary via-secondary to-accent rounded-[2.5rem] opacity-80" />

          {/* Main card */}
          <div className="relative bg-gradient-to-br from-card via-background to-card rounded-[2.5rem] p-8 md:p-12 lg:p-16 overflow-hidden shadow-2xl shadow-primary/10">
            {/* Inner decorative elements */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />

            {/* Large decorative quotes */}
            <motion.div
              className="absolute top-4 left-4 md:top-8 md:left-8"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 0.15, x: 0 } : {}}
              transition={{ delay: 0.5 }}
            >
              <Quote className="w-20 h-20 md:w-28 md:h-28 text-primary" />
            </motion.div>
            <motion.div
              className="absolute bottom-4 right-4 md:bottom-8 md:right-8"
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 0.15, x: 0 } : {}}
              transition={{ delay: 0.6 }}
            >
              <Quote className="w-20 h-20 md:w-28 md:h-28 text-secondary rotate-180" />
            </motion.div>

            <div className="relative z-10">
              {/* Header with rating and verified badge */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
                      transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                    >
                      <Star className="w-8 h-8 fill-secondary text-secondary drop-shadow-[0_0_10px_hsl(var(--secondary)/0.5)]" />
                    </motion.div>
                  ))}
                </div>
                <motion.div
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 shadow-lg shadow-green-500/10"
                  initial={{ opacity: 0, x: 20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.6 }}
                >
                  <Award className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-bold text-green-600">Verified Client</span>
                </motion.div>
              </div>

              {/* Quote text */}
              <motion.blockquote
                className="text-lg md:text-xl lg:text-2xl text-foreground/90 leading-relaxed mb-12"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                {testimonial.quote.split('\n\n').map((paragraph, i) => (
                  <p key={i} className={`${i > 0 ? "mt-6" : ""} first-letter:text-4xl first-letter:font-bold first-letter:text-primary first-letter:mr-1`}>
                    {i === 0 ? `"${paragraph}` : paragraph}
                    {i === testimonial.quote.split('\n\n').length - 1 ? '"' : ''}
                  </p>
                ))}
              </motion.blockquote>

              {/* Elegant divider */}
              <motion.div
                className="flex items-center gap-6 mb-10"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={isInView ? { opacity: 1, scaleX: 1 } : {}}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/30 to-primary/50" />
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="w-3 h-3 rounded-full bg-secondary" />
                  <div className="w-2 h-2 rounded-full bg-accent" />
                </div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-accent/30 to-accent/50" />
              </motion.div>

              {/* Author section - No profile image */}
              <div className="flex flex-col items-center text-center">
                {/* Author name with icon */}
                <motion.div
                  className="flex items-center gap-3 mb-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.75 }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                    <Lightbulb className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {testimonial.author}
                  </h3>
                </motion.div>

                {/* Position */}
                <motion.p
                  className="text-lg font-semibold text-primary mb-5"
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.8 }}
                >
                  {testimonial.position}
                </motion.p>

                {/* Credentials as elegant pills */}
                <motion.div
                  className="flex flex-wrap justify-center gap-3 mb-6"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 0.85 }}
                >
                  {testimonial.credentials.map((credential, i) => (
                    <motion.span
                      key={i}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-muted/80 to-muted border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary transition-all duration-300 cursor-default"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.85 + i * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      {i === 0 && <Building2 className="w-3.5 h-3.5" />}
                      {i === 1 && <Trophy className="w-3.5 h-3.5" />}
                      {i === 2 && <Users className="w-3.5 h-3.5" />}
                      {i === 3 && <Lightbulb className="w-3.5 h-3.5" />}
                      {credential}
                    </motion.span>
                  ))}
                </motion.div>

                {/* Date info */}
                <motion.p
                  className="text-sm text-muted-foreground"
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: 1 }}
                >
                  {testimonial.date} • {testimonial.relationship}
                </motion.p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            <motion.div
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <Star className="w-7 h-7 fill-secondary text-secondary" />
              <span className="font-bold text-foreground text-lg">5.0/5 Rating</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <Users className="w-7 h-7 text-primary" />
              <span className="font-bold text-foreground text-lg">100+ Happy Clients</span>
            </motion.div>
            <motion.div
              className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border/50 shadow-lg hover:shadow-xl hover:border-primary/30 transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <Trophy className="w-7 h-7 text-accent" />
              <span className="font-bold text-foreground text-lg">500+ Projects Delivered</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Testimonials;
