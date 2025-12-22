import { motion, AnimatePresence } from "framer-motion";
import { X, Shield } from "lucide-react";
import { Button } from "./ui/button";

interface EmployeeLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EmployeeLoginModal({ isOpen, onClose }: EmployeeLoginModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
          >
            <div className="bg-background border-2 border-secondary/20 rounded-2xl p-8 shadow-2xl glass">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center animate-glow">
                  <Shield className="w-8 h-8 text-primary-foreground" />
                </div>
                
                <h3 className="text-2xl font-bold text-foreground">
                  Employee Portal Access
                </h3>
                
                <p className="text-muted-foreground">
                  Access the internal ATS (Applicant Tracking System) for managing recruitment, candidates, and employee onboarding.
                </p>
                
                <div className="w-full p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    <strong>Demo Credentials:</strong>
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• recruiter@demo.com / demo</li>
                    <li>• manager@demo.com / demo</li>
                    <li>• owner@demo.com / demo</li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => {
                    // Use environment variable for Employee Portal URL
                    const portalUrl = import.meta.env.VITE_EMPLOYEE_PORTAL_URL || 'http://localhost:8081';
                    window.location.href = portalUrl;
                  }}
                  className="w-full bg-gradient-primary text-primary-foreground hover:shadow-glow transition-all"
                >
                  Access Employee Portal
                </Button>
                
                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
