import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Award, Target, Users, TrendingUp, Globe, Lightbulb } from "lucide-react";

const OurStory = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const highlights = [
    { icon: Award, label: "21+ Years", subtitle: "Industry Experience" },
    { icon: Globe, label: "Global", subtitle: "Market Presence" },
    { icon: Users, label: "High-Performance", subtitle: "Dedicated Team" },
    { icon: TrendingUp, label: "Precision", subtitle: "Output Delivery" },
  ];

  const expertise = [
    "McGraw Hill",
    "Pearson",
    "Bob Jones University",
    "MSD",
    "AstraZeneca",
    "Pfizer",
    "Argos",
  ];

  return (
        <section id="our-story" ref={ref} className="relative py-16 md:py-24 lg:py-32 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-muted/20 via-background to-background">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Section Header */}
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Lightbulb className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Our Journey
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Our Story
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built on precision, creativity, and dependable delivery
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left: Founder Image & Info */}
          <motion.div
            className="relative max-w-md mx-auto lg:mx-0"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative group">
              {/* Decorative background */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-70" />
              
              {/* Image container */}
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-background">
                <div className="aspect-[4/5] relative">
                  <img
                    src="/founder.jpg"
                    alt="Selvaraj V - Founder"
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Founder info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <h3 className="text-3xl font-bold mb-2">Selvaraj V</h3>
                      <p className="text-lg text-white/90 mb-1">Founder & Visionary</p>
                      <p className="text-sm text-white/80">21+ Years of Excellence</p>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating badge */}
              <motion.div
                className="absolute -top-6 -right-6 bg-gradient-to-br from-primary to-accent p-6 rounded-2xl shadow-2xl"
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
              >
                <Award className="w-10 h-10 text-white" />
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Story Content */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="space-y-6 text-foreground/90 leading-relaxed">
              <p className="text-lg">
                <span className="text-2xl font-bold text-primary">DHI Creative Services</span> was built on a simple idea — to combine{" "}
                <span className="font-semibold text-foreground">precision, creativity, and dependable delivery</span> under one roof.
              </p>
              
              <p className="text-lg">
                Founded by <span className="font-bold text-foreground">Selvaraj V</span>, a professional with{" "}
                <span className="font-semibold text-primary">21+ years of experience</span> in digital publishing, packaging production, 
                illustration, and large-scale content operations, artwork & labelling, the company brings deep industry knowledge to every project.
              </p>

              <div className="bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10 rounded-2xl p-6 my-8">
                <p className="text-lg leading-relaxed">
                  Selvaraj has spent over 20 years working with <span className="font-semibold text-foreground">leading publishers, design agencies, 
                  and healthcare companies</span> across APAC, US, EMEA, and global markets.
                </p>
              </div>

              <p className="text-lg">
                With a background in managing <span className="font-semibold text-foreground">high-performing teams</span>, streamlining workflows, 
                improving turnaround times, and ensuring <span className="font-bold text-primary">"High-precision output"</span>, Selvaraj built 
                DHI Creative Services to offer clients a smarter, faster, and more reliable creative production partner.
              </p>

              <p className="text-lg">
                Today, we help <span className="font-semibold text-foreground">businesses, agencies, and publishers</span> with vector art, 
                creative redrawing, premedia & packaging artwork, image production, and digital publishing solutions — all supported by 
                optimized workflows and a dedicated team.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Trusted Companies */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <h3 className="text-center text-lg font-semibold text-muted-foreground mb-8">
            Trusted by Industry Leaders
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {expertise.map((company, index) => (
              <motion.div
                key={index}
                className="px-6 py-3 bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-semibold text-foreground">{company}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Highlights Grid */}
        <motion.div
          className="grid md:grid-cols-4 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {highlights.map((item, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.7 + index * 0.1, duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
              <div className="relative p-6 rounded-2xl bg-card border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
                <div className="inline-flex p-3 bg-gradient-to-br from-primary to-accent rounded-xl mb-4">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-2xl font-bold text-foreground mb-1">{item.label}</h4>
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Founder's Philosophy */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded-3xl blur-2xl" />
            <div className="relative bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 rounded-3xl p-12 shadow-2xl">
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground">Founder's Philosophy</h3>
                  <blockquote className="text-xl md:text-2xl leading-relaxed text-foreground/90 italic border-l-4 border-primary pl-6">
                    "At DHI Creative Services, our philosophy is simple: <span className="font-bold text-primary">Creative excellence</span>, 
                    <span className="font-bold text-accent"> streamlined processes</span>, and{" "}
                    <span className="font-bold text-secondary">client-first service</span> — always."
                  </blockquote>
                  <p className="mt-6 text-right text-lg font-semibold text-foreground">
                    — Selvaraj V, Founder
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default OurStory;
