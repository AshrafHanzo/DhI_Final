import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useData } from "@/contexts/DataContext";
import { API_ENDPOINTS } from "@/config/api";

export default function AddJob() {
  const navigate = useNavigate();
  const { fetchJobs } = useData();
  const [companyNames, setCompanyNames] = useState<string[]>([]);
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [jobTitleOpen, setJobTitleOpen] = useState(false);

  const [form, setForm] = useState({
    company_name: "",
    company_id: "1",
    job_title: "",
    job_description: "",
    address: "",
    openings: "1",
    type: "",
    work_mode: "",
    salary_min: "",
    salary_max: "",
    status: "open",
    urgency: "",
    commission: "",
    tenure: "",
    shift: "",
    category: "",
    experience: "",
    age_min: "",
    age_max: "",
    required_skills: "",
    preferred_skills: "",
    nice_to_have: "",
    languages_required: "",
    seo_keywords: "",
    posted_by: "1",
  });

  useEffect(() => {
    // Fetch unique company names and job titles from existing jobs
    const fetchSuggestions = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.JOBS);
        const jobs = await res.json();

        const uniqueCompanies = [...new Set(jobs.map((j: any) => j.company_name).filter(Boolean))];
        const uniqueTitles = [...new Set(jobs.map((j: any) => j.job_title).filter(Boolean))];

        setCompanyNames(uniqueCompanies as string[]);
        setJobTitles(uniqueTitles as string[]);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      }
    };

    fetchSuggestions();
  }, []);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const payload = {
      ...form,
      company_id: Number(form.company_id),
      openings: Number(form.openings),
      salary_min: form.salary_min ? Number(form.salary_min) : null,
      salary_max: form.salary_max ? Number(form.salary_max) : null,
      commission: form.commission ? Number(form.commission) : null,
      experience: form.experience ? Number(form.experience) : null,
      age_min: form.age_min ? Number(form.age_min) : null,
      age_max: form.age_max ? Number(form.age_max) : null,
      posted_by: Number(form.posted_by),
    };

    await fetch(API_ENDPOINTS.JOBS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // Fetch jobs immediately to update the list
    await fetchJobs();
    navigate("/jobs");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Add New Job</h1>
      <p className="text-muted-foreground">Create a job requirement for your client.</p>

      <Card className="p-6">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Company Name + Job Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Company Name *</Label>
                <div className="relative">
                  <Input
                    placeholder="Enter or select company name"
                    value={form.company_name}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange("company_name", value);
                      // Only show dropdown if there are matching suggestions
                      const hasMatches = companyNames.some(name =>
                        name.toLowerCase().includes(value.toLowerCase())
                      );
                      if (value.length > 0 && hasMatches) {
                        setCompanyOpen(true);
                      } else {
                        setCompanyOpen(false);
                      }
                    }}
                    onFocus={(e) => {
                      if (e.target.value.length > 0) {
                        const hasMatches = companyNames.some(name =>
                          name.toLowerCase().includes(e.target.value.toLowerCase())
                        );
                        if (hasMatches) {
                          setCompanyOpen(true);
                        }
                      }
                    }}
                    onBlur={() => setTimeout(() => setCompanyOpen(false), 200)}
                    required
                    autoComplete="off"
                  />
                  {companyOpen && form.company_name && companyNames.filter((name) => name.toLowerCase().includes(form.company_name.toLowerCase())).length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {companyNames
                        .filter((name) => name.toLowerCase().includes(form.company_name.toLowerCase()))
                        .map((name) => (
                          <div
                            key={name}
                            className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleChange("company_name", name);
                              setCompanyOpen(false);
                            }}
                          >
                            {name}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label>Job Title *</Label>
                <div className="relative">
                  <Input
                    placeholder="Enter or select job title"
                    value={form.job_title}
                    onChange={(e) => {
                      handleChange("job_title", e.target.value);
                      if (e.target.value.length > 0) {
                        setJobTitleOpen(true);
                      } else {
                        setJobTitleOpen(false);
                      }
                    }}
                    onFocus={(e) => {
                      if (e.target.value.length > 0) {
                        setJobTitleOpen(true);
                      }
                    }}
                    onBlur={() => setTimeout(() => setJobTitleOpen(false), 200)}
                    required
                  />
                  {jobTitleOpen && form.job_title && (
                    <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                      {jobTitles
                        .filter((title) => title.toLowerCase().includes(form.job_title.toLowerCase()))
                        .length > 0 ? (
                        jobTitles
                          .filter((title) => title.toLowerCase().includes(form.job_title.toLowerCase()))
                          .map((title) => (
                            <div
                              key={title}
                              className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleChange("job_title", title);
                                setJobTitleOpen(false);
                              }}
                            >
                              {title}
                            </div>
                          ))
                      ) : (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No matches found. You can enter manually.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div>
              <Label>Job Description *</Label>
              <Textarea
                value={form.job_description}
                onChange={(e) => handleChange("job_description", e.target.value)}
                className="h-24"
                required
              />
            </div>

            {/* Address + Openings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Address *</Label>
                <Input
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Openings *</Label>
                <Input
                  type="number"
                  value={form.openings}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 0 && !value.includes('e') && !value.includes('E'))) {
                      handleChange("openings", value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                      e.preventDefault();
                    }
                  }}
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Type + Work Mode */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Job Type *</Label>
                <Select value={form.type} onValueChange={(value) => handleChange("type", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select job type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Full-time">Full-time</SelectItem>
                    <SelectItem value="Part-time">Part-time</SelectItem>
                    <SelectItem value="Contract">Contract</SelectItem>
                    <SelectItem value="Temporary">Temporary</SelectItem>
                    <SelectItem value="Internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Work Mode *</Label>
                <Select value={form.work_mode} onValueChange={(value) => handleChange("work_mode", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select work mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Remote">Remote</SelectItem>
                    <SelectItem value="On-Site">On-Site</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Salary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Min Salary *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.salary_min}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseFloat(value) >= 0 && !value.includes('e') && !value.includes('E'))) {
                      handleChange("salary_min", value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                      e.preventDefault();
                    }
                  }}
                  min="0"
                  required
                />
              </div>

              <div>
                <Label>Max Salary *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={form.salary_max}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseFloat(value) >= 0 && !value.includes('e') && !value.includes('E'))) {
                      handleChange("salary_max", value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                      e.preventDefault();
                    }
                  }}
                  min="0"
                  required
                />
              </div>
            </div>

            {/* Additional Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Urgency</Label>
                <Input value={form.urgency} onChange={(e) => handleChange("urgency", e.target.value)} />
              </div>

              <div>
                <Label>Commission *</Label>
                <Input
                  type="number"
                  value={form.commission}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseFloat(value) >= 0 && !value.includes('e') && !value.includes('E'))) {
                      handleChange("commission", value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                      e.preventDefault();
                    }
                  }}
                  min="0"
                  required
                />
              </div>
            </div>

            {/* More Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Tenure (Days) *</Label>
                <Input
                  type="number"
                  value={form.tenure}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.length <= 3) {
                      handleChange("tenure", value);
                    }
                  }}
                  maxLength={3}
                  placeholder="e.g. 60, 90, 180"
                  required
                />
              </div>

              <div>
                <Label>Shift</Label>
                <Input value={form.shift} onChange={(e) => handleChange("shift", e.target.value)} />
              </div>
            </div>

            {/* Category + Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => handleChange("category", e.target.value)} />
              </div>

              <div>
                <Label>Experience Required</Label>
                <Input
                  type="number"
                  value={form.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                />
              </div>
            </div>

            {/* Age Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Age Min</Label>
                <Input
                  type="number"
                  value={form.age_min}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99 && !value.includes('e') && !value.includes('E'))) {
                      handleChange("age_min", value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                      e.preventDefault();
                    }
                  }}
                  maxLength={2}
                  min="0"
                  max="99"
                  placeholder="e.g. 18"
                />
              </div>

              <div>
                <Label>Age Max</Label>
                <Input
                  type="number"
                  value={form.age_max}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 99 && !value.includes('e') && !value.includes('E'))) {
                      handleChange("age_max", value);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'e' || e.key === 'E' || e.key === '-' || e.key === '+') {
                      e.preventDefault();
                    }
                  }}
                  maxLength={2}
                  min="0"
                  max="99"
                  placeholder="e.g. 65"
                />
              </div>
            </div>

            {/* Text Fields */}
            <div>
              <Label>Required Skills</Label>
              <Textarea
                value={form.required_skills}
                onChange={(e) => handleChange("required_skills", e.target.value)}
              />
            </div>

            <div>
              <Label>Preferred Skills</Label>
              <Textarea
                value={form.preferred_skills}
                onChange={(e) => handleChange("preferred_skills", e.target.value)}
              />
            </div>

            <div>
              <Label>Nice to Have</Label>
              <Textarea
                value={form.nice_to_have}
                onChange={(e) => handleChange("nice_to_have", e.target.value)}
              />
            </div>

            <div>
              <Label>Languages Required</Label>
              <Textarea
                value={form.languages_required}
                onChange={(e) => handleChange("languages_required", e.target.value)}
              />
            </div>

            <div>
              <Label>SEO Keywords</Label>
              <Textarea
                value={form.seo_keywords}
                onChange={(e) => handleChange("seo_keywords", e.target.value)}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4">
              <Button variant="outline" type="button" onClick={() => navigate("/jobs")}>
                Cancel
              </Button>
              <Button type="submit">Create Job</Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
