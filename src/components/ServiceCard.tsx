import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { LucideIcon } from "lucide-react";
import { useState } from "react";

interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  items: string[];
  cta: string;
  gradient?: string;
  index?: number;
  isInView?: boolean;
}

const ServiceCard = ({
  icon: Icon,
  title,
  description,
  items,
  cta,
  gradient = "from-primary to-accent",
  index = 0,
  isInView = true,
}: ServiceCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: 0.2 + index * 0.1, duration: 0.6 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative bg-card p-5 sm:p-6 md:p-8 rounded-2xl shadow-elegant hover:shadow-glow transition-all duration-300 border border-border hover:border-secondary/50 card-3d overflow-hidden"
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-secondary/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={isHovered ? { x: '100%' } : { x: '-100%' }}
        transition={{ duration: 0.9, ease: 'easeInOut' }}
      />

      {/* Gradient overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

      <div className="relative z-10">
        <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${gradient} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md`}>
          <Icon className="w-8 h-8 text-white" />
        </div>

        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4">{title}</h3>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">{description}</p>

        <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
          {items.map((item, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex items-start gap-2 text-xs sm:text-sm text-foreground/90"
            >
              <span className="text-secondary mt-0.5 sm:mt-1 font-bold text-base sm:text-lg flex-shrink-0">✓</span>
              <span className="break-words">{item}</span>
            </motion.li>
          ))}
        </ul>

        <Button
          variant="outline"
          className="w-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-secondary-foreground transition-all btn-press"
          onClick={() => {
            const trimmedTitle = title.trim();
            if (trimmedTitle === "Digital Publishing Services") {
              window.location.href = "/digital-publishing";
            } else if (trimmedTitle === "Premedia Services") {
              window.location.href = "/premedia-services";
            } else {
              document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          {cta}
        </Button>
      </div>
    </motion.div>
  );
};

export default ServiceCard;
