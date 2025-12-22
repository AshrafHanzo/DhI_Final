import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Mail, MapPin, Send, MessageCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    projectType: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create mailto link with form data
    const subject = encodeURIComponent(`New Contact Form Submission from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\n` +
      `Company: ${formData.company || 'N/A'}\n` +
      `Email: ${formData.email}\n` +
      `Phone: ${formData.phone || 'N/A'}\n` +
      `Project Type: ${formData.projectType || 'N/A'}\n\n` +
      `Message:\n${formData.message}`
    );
    
    const mailtoLink = `mailto:selvaraj.veilumuthu@dhicreativeservices.com?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
    
    toast({
      title: "Opening email client...",
      description: "Your default email client will open with the form details.",
    });
    
    setFormData({
      name: "",
      company: "",
      email: "",
      phone: "",
      projectType: "",
      message: "",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" ref={ref} className="relative py-16 md:py-24 px-4 sm:px-6 overflow-hidden bg-gradient-to-b from-background via-muted/10 to-background">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <div className="container mx-auto max-w-7xl relative z-10">
        <motion.div
          className="text-center mb-16"
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
            <MessageCircle className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Get In Touch
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
            Ready to Start? Let's Talk.
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind? We'd love to hear from you. Send us a message and we'll respond within 24 hours.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-12">
          {/* Contact Info - Left Side */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            {/* Contact Cards */}
            <motion.a
              href="tel:+918056092982"
              className="group block"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-foreground">Phone</h3>
                    <p className="text-muted-foreground group-hover:text-primary transition-colors text-base">
                      +91 80560 92982
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Click to call</p>
                  </div>
                </div>
              </div>
            </motion.a>

            <motion.a
              href="mailto:selvaraj.veilumuthu@dhicreativeservices.com"
              className="group block"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-accent/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-secondary group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-foreground">Email</h3>
                    <p className="text-muted-foreground group-hover:text-accent transition-colors text-sm break-all">
                      selvaraj.veilumuthu@dhicreativeservices.com
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Click to email</p>
                  </div>
                </div>
              </div>
            </motion.a>

            <motion.a
              href="https://maps.google.com/?q=The+WorkVilla+Arcade+Centre+110/1+Mahatma+Gandhi+Road+Nungambakkam+Chennai+600034"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
              whileHover={{ scale: 1.02, y: -4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-secondary/50 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-primary group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1 text-foreground">Visit Us</h3>
                    <p className="text-muted-foreground group-hover:text-secondary transition-colors text-sm leading-relaxed">
                      The WorkVilla, Arcade Centre, 3rd Floor,<br />
                      110/1, Mahatma Gandhi Road, Nungambakkam,<br />
                      Chennai 600034
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Click to view on map</p>
                  </div>
                </div>
              </div>
            </motion.a>

            {/* Response Time Badge */}
            <motion.div
              className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-primary" />
                <div>
                  <h4 className="font-bold text-foreground">Quick Response</h4>
                  <p className="text-sm text-muted-foreground">We typically respond within 24 hours</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form - Right Side */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500 opacity-50" />
              <div className="relative p-8 md:p-10 rounded-3xl bg-card border border-border shadow-2xl">
                <h3 className="text-2xl font-bold mb-2 text-foreground">Send us a message</h3>
                <p className="text-muted-foreground mb-8">Fill out the form below and we'll get back to you as soon as possible.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-semibold">Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="mt-2 h-12 border-2 focus:border-primary transition-colors"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="company" className="text-sm font-semibold">Company</Label>
                      <Input
                        id="company"
                        value={formData.company}
                        onChange={(e) => handleChange("company", e.target.value)}
                        className="mt-2 h-12 border-2 focus:border-primary transition-colors"
                        placeholder="Your company name"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="mt-2 h-12 border-2 focus:border-primary transition-colors"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-sm font-semibold">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="mt-2 h-12 border-2 focus:border-primary transition-colors"
                        placeholder="+91 12345 67890"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="projectType" className="text-sm font-semibold">Project Type</Label>
                    <Select
                      value={formData.projectType}
                      onValueChange={(value) => handleChange("projectType", value)}
                    >
                      <SelectTrigger className="mt-2 h-12 border-2 focus:border-primary transition-colors">
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premedia">Premedia Services</SelectItem>
                        <SelectItem value="publishing">Digital Publishing</SelectItem>
                        <SelectItem value="illustration">Illustration Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-semibold">Brief Description *</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="mt-2 min-h-[140px] border-2 focus:border-primary transition-colors resize-none"
                      placeholder="Tell us about your project requirements..."
                    />
                  </div>

                  <div className="flex items-center gap-2 p-4 rounded-xl bg-muted/50 border border-border">
                    <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <p className="text-xs text-muted-foreground">
                      We respect your privacy — all information is handled securely and confidentially.
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 bg-gradient-to-r from-primary to-accent text-white hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 text-lg font-semibold group"
                  >
                    <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
