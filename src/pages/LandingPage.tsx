import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Upload, CheckCircle2 } from "lucide-react";

interface Job {
  id: number;
  job_title: string;
  company_name: string;
  company?: string;
  company_id?: number;
  status: string;
  job_description?: string;
  address?: string;
  openings?: number;
  type?: string;
  work_mode?: string;
  salary_min?: number;
  salary_max?: number;
}

const LandingPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [formData, setFormData] = useState({
    candidateName: "",
    mobileNumber: "",
    city: "",
    jobId: "",
    resume: null as File | null,
  });

  useEffect(() => {
    // Facebook Pixel tracking
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
    
    // Fetch active jobs from backend
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      console.log("Fetching jobs from API...");
      const response = await fetch("https://api.dhicreativeservices.com/api/jobs/");
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("All jobs from API:", data);
        console.log("Total jobs received:", data.length);
        
        // Filter for the specific 4 jobs (exact match from database)
        const targetJobs = [
          { title: "Customer Service", company: "Shaadi.com" },
          { title: "Tele Sales", company: "Eureka" },
          { title: "Business Development", company: "SuperNova" },
          { title: "Outbond Sales", company: "Cogent" }  // Note: "Outbond" not "Outbound"
        ];
        
        const filteredJobs = data.filter((job: Job) => {
          // Normalize by removing extra spaces and converting to lowercase
          const jobTitle = (job.job_title || '').replace(/\s+/g, ' ').toLowerCase().trim();
          const companyName = (job.company_name || job.company || '').replace(/\s+/g, ' ').toLowerCase().trim();
          
          const isMatch = targetJobs.some(target => {
            const targetTitle = target.title.replace(/\s+/g, ' ').toLowerCase().trim();
            const targetCompany = target.company.replace(/\s+/g, ' ').toLowerCase().trim();
            const matches = jobTitle === targetTitle && companyName === targetCompany;
            
            if (matches) {
              console.log(`✓ Matched: "${job.job_title}" - "${job.company_name || job.company}"`);
            }
            
            return matches;
          });
          
          return isMatch;
        });
        
        console.log("Filtered jobs:", filteredJobs);
        console.log("Filtered jobs count:", filteredJobs.length);
        
        // Verify all 4 target jobs are found
        targetJobs.forEach(target => {
          const found = filteredJobs.find(j => 
            j.job_title.toLowerCase().trim() === target.title.toLowerCase().trim() &&
            (j.company_name || j.company || '').toLowerCase().trim() === target.company.toLowerCase().trim()
          );
          if (!found) {
            console.warn(`⚠ Missing: "${target.title}" - "${target.company}"`);
          }
        });
        
        setJobs(filteredJobs);
      } else {
        console.error("API response not OK:", response.status);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Could not load available positions",
        variant: "destructive",
      });
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, resume: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (
      !formData.candidateName ||
      !formData.mobileNumber ||
      !formData.city ||
      !formData.jobId ||
      !formData.resume
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Validate mobile number (10 digits)
    if (!/^\d{10}$/.test(formData.mobileNumber)) {
      toast({
        title: "Invalid Mobile Number",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const selectedJob = jobs.find(job => job.id.toString() === formData.jobId);
      if (!selectedJob) {
        throw new Error("Selected job not found");
      }

      const formDataToSend = new FormData();
      formDataToSend.append("full_name", formData.candidateName);
      formDataToSend.append("phone_number", formData.mobileNumber);
      formDataToSend.append("city", formData.city);
      formDataToSend.append("job_id", formData.jobId);
      formDataToSend.append("sourced_from", "Meta");
      formDataToSend.append("resume", formData.resume);

      const response = await fetch("https://api.dhicreativeservices.com/api/candidates/", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to submit application");
      }
      
      // Track successful submission with Facebook Pixel
      if (window.fbq && selectedJob) {
        window.fbq('track', 'Lead', {
          content_name: `${selectedJob.job_title} - ${selectedJob.company_name}`,
          content_category: 'Job Application',
          value: 1.00,
          currency: 'USD'
        });
      }

      setSubmitted(true);
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We'll contact you soon.",
      });

      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          candidateName: "",
          mobileNumber: "",
          city: "",
          jobId: "",
          resume: null,
        });
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting application:", error);
      toast({
        title: "Submission Failed",
        description: "Please try again later or contact us directly",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center transform animate-in fade-in zoom-in duration-500">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="w-20 h-20 text-green-500 animate-in zoom-in duration-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Application Received!
          </h2>
          <p className="text-gray-600 text-lg">
            Thank you for applying. Our team will review your application and
            contact you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-xl w-full transform transition-all duration-300 hover:shadow-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Rocket className="w-8 h-8 text-blue-600 animate-bounce" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              We Are Hiring
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Join our amazing team and grow your career
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Candidate Name */}
          <div className="space-y-2">
            <Label htmlFor="candidateName" className="text-base font-semibold text-gray-700">
              Candidate Name<span className="text-red-500">*</span>
            </Label>
            <Input
              id="candidateName"
              placeholder="Enter your full name"
              value={formData.candidateName}
              onChange={(e) => handleInputChange("candidateName", e.target.value)}
              className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>

          {/* Mobile Number */}
          <div className="space-y-2">
            <Label htmlFor="mobileNumber" className="text-base font-semibold text-gray-700">
              Mobile Number<span className="text-red-500">*</span>
            </Label>
            <Input
              id="mobileNumber"
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
              maxLength={10}
              className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>

          {/* City */}
          <div className="space-y-2">
            <Label htmlFor="city" className="text-base font-semibold text-gray-700">
              City<span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              placeholder="Enter city name"
              value={formData.city}
              onChange={(e) => handleInputChange("city", e.target.value)}
              className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>

          {/* Job Position */}
          <div className="space-y-2">
            <Label htmlFor="jobPosition" className="text-base font-semibold text-gray-700">
              Job Position<span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.jobId}
              onValueChange={(value) => handleInputChange("jobId", value)}
              required
              disabled={loadingJobs}
            >
              <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-blue-500">
                <SelectValue placeholder={loadingJobs ? "Loading positions..." : "Select Position"} />
              </SelectTrigger>
              <SelectContent>
                {jobs.length === 0 && !loadingJobs ? (
                  <SelectItem value="none" disabled className="text-base py-3">
                    No positions available
                  </SelectItem>
                ) : (
                  jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id.toString()} className="text-base py-3">
                      {job.job_title} - {job.company_name || job.company}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Upload Resume */}
          <div className="space-y-2">
            <Label htmlFor="resume" className="text-base font-semibold text-gray-700">
              Upload Resume (PDF/Image/Word)<span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                required
              />
              <Upload className="absolute right-3 top-3 w-6 h-6 text-gray-400 pointer-events-none" />
            </div>
            {formData.resume && (
              <p className="text-sm text-green-600 mt-1">
                ✓ {formData.resume.name}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </div>
            ) : (
              "Submit Application"
            )}
          </Button>
        </form>

        
      </div>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    fbq: any;
  }
}

export default LandingPage;
