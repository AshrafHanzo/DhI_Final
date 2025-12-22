import { useState, useEffect } from "react";
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
import { Rocket, Upload, CheckCircle2, Briefcase } from "lucide-react";

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

const LandingPage2 = () => {
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
        
        // Filter for the 3 Alldigi Tech jobs
        const targetJobs = [
          { title: "Voice Call", company: "Alldigi_Tech" },
          { title: "Non-Voice Call", company: "Alldigi_Tech" },
          { title: "Field Sales Executive", company: "Alldigi_Tech" }
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
        
        // Verify all 3 target jobs are found
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-center">
            <div className="bg-green-100 rounded-full p-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gray-900">Success!</h2>
            <p className="text-lg text-gray-600">
              Your application has been submitted successfully
            </p>
          </div>
          <div className="pt-4">
            <p className="text-sm text-gray-500">
              We'll review your application and contact you soon
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Briefcase className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Hiring for Alldigi Tech
            </h1>
            <p className="text-xl text-white/90">
              Join our dynamic team and accelerate your career
            </p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                className="h-12 text-base border-2 border-gray-200 focus:border-orange-500 transition-all duration-200"
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
                onChange={(e) => handleInputChange("mobileNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="h-12 text-base border-2 border-gray-200 focus:border-orange-500 transition-all duration-200"
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
                className="h-12 text-base border-2 border-gray-200 focus:border-orange-500 transition-all duration-200"
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
                <SelectTrigger className="h-12 text-base border-2 border-gray-200 focus:border-orange-500">
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
                        {job.job_title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Resume Upload */}
            <div className="space-y-2">
              <Label htmlFor="resume" className="text-base font-semibold text-gray-700">
                Upload Resume (PDF/Image/Word)<span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <input
                  id="resume"
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  required
                />
                <label
                  htmlFor="resume"
                  className="flex items-center justify-center h-12 px-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
                >
                  <Upload className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-base text-gray-600">
                    {formData.resume ? formData.resume.name : "Choose file"}
                  </span>
                </label>
                {formData.resume && (
                  <div className="mt-2 text-sm text-green-600 flex items-center">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {formData.resume.name}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Rocket className="h-5 w-5 mr-2" />
                  Submit Application
                </div>
              )}
            </Button>

            
          </form>
        </div>
      </div>
    </div>
  );
};

export default LandingPage2;
