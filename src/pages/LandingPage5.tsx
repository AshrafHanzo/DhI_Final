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
import { Users, Upload, CheckCircle2, Sparkles, Briefcase } from "lucide-react";

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

const LandingPage5 = () => {
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

                // Filter for HR Recruiter Intern jobs
                const hrRecruiterJobs = data.filter((job: Job) => {
                    const jobTitle = (job.job_title || '').replace(/[\s\n\r]+/g, ' ').toLowerCase().trim();

                    const isMatch = jobTitle.includes('hr recruiter intern') ||
                        jobTitle.includes('hr recruiter') ||
                        jobTitle.includes('recruiter intern');

                    if (isMatch) {
                        console.log(`✓ Found HR Recruiter Intern job: "${job.job_title}" - "${job.company_name || job.company}"`);
                    }

                    return isMatch;
                });

                console.log("HR Recruiter Intern jobs:", hrRecruiterJobs);
                console.log("HR Recruiter Intern jobs count:", hrRecruiterJobs.length);

                setJobs(hrRecruiterJobs);
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-md w-full text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex justify-center">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-4 shadow-lg">
                            <CheckCircle2 className="h-16 w-16 text-white" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Success!</h2>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-300/30 to-indigo-300/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-48 h-48 bg-gradient-to-r from-indigo-300/30 to-cyan-300/30 rounded-full blur-3xl animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 rounded-full blur-2xl animate-bounce delay-300"></div>

                {/* Floating icons */}
                <Sparkles className="absolute top-20 right-1/4 w-6 h-6 text-blue-400/40 animate-pulse" />
                <Briefcase className="absolute bottom-32 left-1/4 w-8 h-8 text-indigo-400/40 animate-bounce delay-500" />
                <Users className="absolute top-1/3 right-10 w-5 h-5 text-cyan-400/40 animate-pulse delay-1000" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden transform hover:scale-[1.01] transition-all duration-500 border border-blue-100">
                    {/* Header Section - Professional Blue/Indigo Theme */}
                    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 text-center relative overflow-hidden">
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>

                        <div className="relative z-10">
                            <div className="flex justify-center mb-4">
                                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 shadow-lg ring-4 ring-white/30">
                                    <Users className="h-12 w-12 text-white drop-shadow-lg" />
                                </div>
                            </div>
                            <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg tracking-wide">
                                🎯 HR Recruiter Intern
                            </h1>
                            <p className="text-xl text-white/90 drop-shadow font-medium">
                                Kickstart Your Career in Human Resources
                            </p>
                            <div className="mt-4 flex justify-center gap-2">
                                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                                    🚀 Great Learning Experience
                                </span>
                                <span className="px-3 py-1 bg-white/20 rounded-full text-white text-sm font-medium backdrop-blur-sm">
                                    📈 Career Growth
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Form Section */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Candidate Name */}
                        <div className="space-y-2">
                            <Label htmlFor="candidateName" className="text-base font-semibold text-gray-700 flex items-center">
                                <span className="mr-2">👤</span>
                                Candidate Name<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="candidateName"
                                placeholder="Enter your full name"
                                value={formData.candidateName}
                                onChange={(e) => handleInputChange("candidateName", e.target.value)}
                                className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl bg-blue-50/50"
                                required
                            />
                        </div>

                        {/* Mobile Number */}
                        <div className="space-y-2">
                            <Label htmlFor="mobileNumber" className="text-base font-semibold text-gray-700 flex items-center">
                                <span className="mr-2">📱</span>
                                Mobile Number<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="mobileNumber"
                                type="tel"
                                placeholder="Enter 10-digit mobile number"
                                value={formData.mobileNumber}
                                onChange={(e) => handleInputChange("mobileNumber", e.target.value.replace(/\D/g, "").slice(0, 10))}
                                className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl bg-blue-50/50"
                                required
                            />
                        </div>

                        {/* City */}
                        <div className="space-y-2">
                            <Label htmlFor="city" className="text-base font-semibold text-gray-700 flex items-center">
                                <span className="mr-2">📍</span>
                                City<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Input
                                id="city"
                                placeholder="Enter city name"
                                value={formData.city}
                                onChange={(e) => handleInputChange("city", e.target.value)}
                                className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 rounded-xl bg-blue-50/50"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="jobPosition" className="text-base font-semibold text-gray-700 flex items-center">
                                <span className="mr-2">💼</span>
                                Job Position<span className="text-red-500 ml-1">*</span>
                            </Label>
                            <Select
                                value={formData.jobId}
                                onValueChange={(value) => handleInputChange("jobId", value)}
                                required
                                disabled={loadingJobs}
                            >
                                <SelectTrigger className="h-12 text-base border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-xl bg-blue-50/50">
                                    <SelectValue placeholder={loadingJobs ? "Loading positions..." : "Select Position"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {jobs.length === 0 && !loadingJobs ? (
                                        <SelectItem value="none" disabled className="text-base py-3">
                                            No positions available
                                        </SelectItem>
                                    ) : (
                                        jobs.map((job) => (
                                            <SelectItem key={job.id} value={job.id.toString()} className="text-base py-3 cursor-pointer hover:bg-blue-50">
                                                {job.job_title} ({job.type || 'Internship'})
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Resume Upload */}
                        <div className="space-y-2">
                            <Label htmlFor="resume" className="text-base font-semibold text-gray-700 flex items-center">
                                <span className="mr-2">📄</span>
                                Upload Resume (PDF/Image/Word)<span className="text-red-500 ml-1">*</span>
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
                                    className="flex items-center justify-center h-12 px-4 border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 group bg-blue-50/30"
                                >
                                    <Upload className="h-5 w-5 text-blue-400 mr-2 group-hover:text-blue-600 transition-colors" />
                                    <span className="text-base text-gray-600 group-hover:text-blue-700 transition-colors">
                                        {formData.resume ? formData.resume.name : "Choose file"}
                                    </span>
                                </label>
                                {formData.resume && (
                                    <div className="mt-2 text-sm text-blue-600 flex items-center animate-in slide-in-from-top-2 duration-300">
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
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-700 hover:via-indigo-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl transform hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group"
                        >
                            {/* Button shimmer */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                            {loading ? (
                                <div className="flex items-center justify-center relative z-10">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    Submitting...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center relative z-10">
                                    <Users className="h-5 w-5 mr-2" />
                                    Submit Application
                                </div>
                            )}
                        </Button>

                        {/* Trust badges */}
                        <div className="flex justify-center gap-4 pt-4">
                            <div className="flex items-center text-xs text-gray-500">
                                <CheckCircle2 className="h-4 w-4 text-green-500 mr-1" />
                                Secure & Confidential
                            </div>
                            <div className="flex items-center text-xs text-gray-500">
                                <Sparkles className="h-4 w-4 text-blue-500 mr-1" />
                                Quick Response
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Add shimmer animation */}
            <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
        </div>
    );
};

export default LandingPage5;
