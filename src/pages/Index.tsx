import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import ImageCarousel from "@/components/ImageCarousel";
import Services from "@/components/Services";
import Testimonials from "@/components/Testimonials";
import OurStory from "@/components/OurStory";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <ImageCarousel />
      <Services />
      <Testimonials />
      <OurStory />
      <Contact />
      <Footer />
    </div>
  );
};

export default Index;
