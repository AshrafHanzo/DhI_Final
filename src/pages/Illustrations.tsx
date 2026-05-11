import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Palette, X, ChevronLeft, ChevronRight } from "lucide-react";

const Illustrations = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<{ src: string; title: string; category: string } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const categories = [
    { id: "all", name: "All Work", count: 0 },
    { id: "character", name: "Character & Mascot Design", count: 6 },
    { id: "emblem", name: "Emblem Illustration", count: 4 },
    { id: "high-detailed", name: "High Detailed Vector", count: 3 },
    { id: "image-editing", name: "Image Editing Services", count: 14 },
    { id: "line-art", name: "Line Art", count: 4 },
    { id: "photo-vector", name: "Photo to Vector", count: 4 },
    { id: "raster-vector", name: "Raster to Vector", count: 2 },
    { id: "sketch-vector", name: "Sketch to Vector", count: 2 },
    { id: "vector-artwork", name: "Vector Artwork", count: 6 },
  ];

  const illustrations = [
    // Character & Mascot Design
    { id: 1, src: "/illustrations/character-mascot/Character-1.png", title: "Character Design 1", category: "character" },
    { id: 2, src: "/illustrations/character-mascot/Character-2.png", title: "Character Design 2", category: "character" },
    { id: 3, src: "/illustrations/character-mascot/Character-3.png", title: "Character Design 3", category: "character" },
    { id: 4, src: "/illustrations/character-mascot/Character-4.png", title: "Character Design 4", category: "character" },
    { id: 5, src: "/illustrations/character-mascot/Character-5.png", title: "Character Design 5", category: "character" },
    { id: 6, src: "/illustrations/character-mascot/Character-6.png", title: "Character Design 6", category: "character" },

    // Emblem Illustration
    { id: 7, src: "/illustrations/emblem/Emblem-Before-After.jpeg", title: "Emblem Before & After", category: "emblem" },
    { id: 8, src: "/illustrations/emblem/Emblem-2.png", title: "Professional Badge Design", category: "emblem" },
    { id: 9, src: "/illustrations/emblem/Emblem-3.png", title: "Fire Emblem Illustration", category: "emblem" },

    // High Detailed Vector
    { id: 10, src: "/illustrations/high-detailed/High detailed vector_02 copy.png", title: "High Detailed Vector Design 1", category: "high-detailed" },
    { id: 11, src: "/illustrations/high-detailed/High detailed vector_03 copy.png", title: "High Detailed Vector Design 2", category: "high-detailed" },
    { id: 12, src: "/illustrations/high-detailed/High detailed vector_04 copy.png", title: "High Detailed Vector Design 3", category: "high-detailed" },

    // Image Editing Services
    { id: 22, src: "/illustrations/Image editing services/Image Editing Services_Page_02.png", title: "Image Editing Services 1", category: "image-editing" },
    { id: 23, src: "/illustrations/Image editing services/Image Editing Services_Page_03.png", title: "Image Editing Services 2", category: "image-editing" },
    { id: 24, src: "/illustrations/Image editing services/Image Editing Services_Page_04.png", title: "Image Editing Services 3", category: "image-editing" },
    { id: 25, src: "/illustrations/Image editing services/Image Editing Services_Page_05.png", title: "Image Editing Services 4", category: "image-editing" },
    { id: 26, src: "/illustrations/Image editing services/Image Editing Services_Page_06.png", title: "Image Editing Services 5", category: "image-editing" },
    { id: 27, src: "/illustrations/Image editing services/Image Editing Services_Page_07.png", title: "Image Editing Services 6", category: "image-editing" },
    { id: 28, src: "/illustrations/Image editing services/Image Editing Services_Page_08.png", title: "Image Editing Services 7", category: "image-editing" },
    { id: 29, src: "/illustrations/Image editing services/Image Editing Services_Page_09.png", title: "Image Editing Services 8", category: "image-editing" },
    { id: 30, src: "/illustrations/Image editing services/Image Editing Services_Page_10.png", title: "Image Editing Services 9", category: "image-editing" },
    { id: 31, src: "/illustrations/Image editing services/Image Editing Services_Page_11.png", title: "Image Editing Services 10", category: "image-editing" },
    { id: 32, src: "/illustrations/Image editing services/Image Editing Services_Page_12.png", title: "Image Editing Services 11", category: "image-editing" },
    { id: 33, src: "/illustrations/Image editing services/Image Editing Services_Page_13.png", title: "Image Editing Services 12", category: "image-editing" },
    { id: 34, src: "/illustrations/Image editing services/Image Editing Services_Page_15.png", title: "Image Editing Services 13", category: "image-editing" },
    { id: 35, src: "/illustrations/Image editing services/Image Editing Services_Page_16.png", title: "Image Editing Services 14", category: "image-editing" },

    // Line Art
    { id: 13, src: "/illustrations/line-art/Line_Art_Before_After.jpeg", title: "Line Art Before & After", category: "line-art" },
    { id: 14, src: "/illustrations/line-art/Line_Art_Before_After2.jpeg", title: "Line Art Before & After 2", category: "line-art" },

    // Photo to Vector
    { id: 15, src: "/illustrations/photo-to-vector/Photo to Vector Before_After.jpeg", title: "Photo to Vector Before & After", category: "photo-vector" },
    { id: 16, src: "/illustrations/photo-to-vector/Phot to Vector Before_After2.jpeg", title: "Photo to Vector Before & After 2", category: "photo-vector" },

    // Raster to Vector
    { id: 17, src: "/illustrations/raster-to-vector/Raster to Vector Before_After.jpeg", title: "Raster to Vector Before & After", category: "raster-vector" },

    // Sketch to Vector
    { id: 18, src: "/illustrations/sketch-to-vector/Sketch-to-vector-before_after.jpeg", title: "Sketch to Vector Before & After", category: "sketch-vector" },

    // Vector Artwork
    { id: 19, src: "/illustrations/vector-artwork/Vector_artwork_Before-After.jpeg", title: "Vector Artwork Before & After", category: "vector-artwork" },
    { id: 20, src: "/illustrations/vector-artwork/Vector_artwork_before_after.jpeg", title: "Vector Artwork Before & After 2", category: "vector-artwork" },
    { id: 21, src: "/illustrations/vector-artwork/vector_artwork_before_after2.jpeg", title: "Vector Artwork Before & After 3", category: "vector-artwork" },
  ];

  // Update total count
  categories[0].count = illustrations.length;

  const filteredIllustrations = activeCategory === "all"
    ? illustrations
    : illustrations.filter(img => img.category === activeCategory);

  const openLightbox = (image: typeof illustrations[0], index: number) => {
    setSelectedImage(image);
    setCurrentImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const nextImage = () => {
    const nextIndex = (currentImageIndex + 1) % filteredIllustrations.length;
    setSelectedImage(filteredIllustrations[nextIndex]);
    setCurrentImageIndex(nextIndex);
  };

  const prevImage = () => {
    const prevIndex = (currentImageIndex - 1 + filteredIllustrations.length) % filteredIllustrations.length;
    setSelectedImage(filteredIllustrations[prevIndex]);
    setCurrentImageIndex(prevIndex);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Filter Tabs */}
      <section className="pt-24 py-4 md:py-8 px-4 sm:px-6 sticky top-20 z-30 bg-background/95 backdrop-blur-xl border-b border-border shadow-lg">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category, index) => (
              <motion.button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl text-sm sm:text-base font-semibold transition-all duration-300 ${activeCategory === category.id
                  ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                  : "bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground"
                  }`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {category.name}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12 md:py-16 lg:py-20 px-4 sm:px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredIllustrations.map((image, index) => (
                <motion.div
                  key={image.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.4 }}
                  className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer bg-gradient-to-br from-muted to-background p-4"
                  onClick={() => openLightbox(image, index)}
                >
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="text-white font-bold text-lg mb-1">{image.title}</h3>
                      <p className="text-white/70 text-sm capitalize">
                        {categories.find(c => c.id === image.category)?.name}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                      <Palette className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredIllustrations.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl text-muted-foreground">No illustrations found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="w-6 h-6 text-white" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>

            <motion.div
              className="max-w-7xl w-full mx-4 flex flex-col items-center"
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-h-[80vh] flex items-center justify-center">
                <img
                  src={selectedImage.src}
                  alt={selectedImage.title}
                  className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=1200&h=1200&fit=crop";
                  }}
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-white text-2xl font-bold mb-2">{selectedImage.title}</h3>
                <p className="text-white/70 capitalize">
                  {categories.find(c => c.id === selectedImage.category)?.name}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Illustrations;
