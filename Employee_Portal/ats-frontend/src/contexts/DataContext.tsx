import React, { createContext, useContext, useEffect, useState } from "react";
import { Job, Candidate, Application } from "@/types";
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

interface DataContextType {
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];

  fetchJobs: () => Promise<void>;
  fetchCandidates: () => Promise<void>;
  fetchApplications: () => Promise<void>;

  createJob: (payload: any) => Promise<void>;
  addCandidate: (payload: FormData) => Promise<void>;
  addApplication: (payload: any) => Promise<void>;
  updateApplicationStatus: (applicationId: number, newStatus: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  // ======================================================
  // FETCH JOBS
  // ======================================================
  const fetchJobs = async () => {
    try {
      console.log('[DataContext] Fetching jobs from:', API_ENDPOINTS.JOBS);
      const res = await fetch(API_ENDPOINTS.JOBS);
      if (!res.ok) {
        console.error('[DataContext] Jobs fetch failed:', res.status, res.statusText);
        throw new Error("Failed to fetch jobs");
      }
      const data = await res.json();
      console.log('[DataContext] Jobs fetched successfully:', data.length, 'jobs');
      setJobs(data);
    } catch (err) {
      console.error("[DataContext] Error fetching jobs:", err);
      setJobs([]); // Set empty array on error instead of leaving undefined
    }
  };

  // ======================================================
  // FETCH CANDIDATES
  // ======================================================
  const fetchCandidates = async () => {
    try {
      const res = await fetch(API_ENDPOINTS.CANDIDATES);
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Candidates API error:", res.status, errorText);
        throw new Error("Failed to fetch candidates");
      }

      const data = await res.json();
      console.log('Fetched candidates from API:', data.length, 'candidates');

      // MAP BACKEND → FRONTEND NAMING - include ALL fields
      const mapped = data.map((c: any) => ({
        id: c.id,
        full_name: c.full_name,
        fathers_name: c.fathers_name,
        phone_number: c.phone_number,
        email_address: c.email_address,
        date_of_birth: c.date_of_birth,
        gender: c.gender,
        aadhaar_number: c.aadhaar_number,
        street_address: c.street_address,
        area_locality: c.area_locality,
        city: c.city,
        pincode: c.pincode,
        resume_url: c.resume_url,
        status: c.status || "new",
        job_id: c.job_id,
        created_at: c.created_at,
        updated_at: c.updated_at,
        // Professional profile fields
        select_languages: c.select_languages,
        educational_quality: c.educational_quality,
        work_experience: c.work_experience,
        additional_months: c.additional_months,
        technical_professional_skills: c.technical_professional_skills,
        preferred_industries_categories: c.preferred_industries_categories,
        preferred_employment_types: c.preferred_employment_types,
        preferred_work_types: c.preferred_work_types,
      }));

      console.log('Mapped candidates:', mapped);
      setCandidates(mapped);
    } catch (err) {
      console.error("Error fetching candidates:", err);
      setCandidates([]);
    }
  };


  const fetchApplications = async () => {
    try {
      console.log('[DataContext] Fetching applications from:', API_ENDPOINTS.APPLICATIONS);
      const res = await fetch(API_ENDPOINTS.APPLICATIONS);
      if (!res.ok) {
        console.error('[DataContext] Applications fetch failed:', res.status, res.statusText);
        throw new Error("Failed to fetch applications");
      }

      const data = await res.json();
      console.log('[DataContext] Applications fetched successfully:', data.length, 'applications');
      setApplications(data);
    } catch (err) {
      console.error("[DataContext] Error fetching applications:", err);
      setApplications([]); // Set empty array on error instead of leaving undefined
    }
  };

  // ======================================================
  // CREATE JOB
  // ======================================================
  const createJob = async (payload: any) => {
    try {
      const res = await fetch(API_ENDPOINTS.JOBS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create job");

      await fetchJobs(); // refresh list
    } catch (err) {
      console.error("Create job error:", err);
    }
  };

  // ======================================================
  // ADD CANDIDATE
  // ======================================================
  const addCandidate = async (formData: FormData) => {
    try {
      console.log('Sending candidate to backend...');

      const res = await fetch(API_ENDPOINTS.CANDIDATES, {
        method: "POST",
        body: formData, // no headers for FormData
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend error:', res.status, errorText);
        throw new Error("Failed to add candidate");
      }

      const data = await res.json();
      console.log('Candidate created:', data);

      // Refresh all data to ensure consistency
      await fetchCandidates();
      await fetchApplications();

      console.log('Data refreshed after adding candidate');
    } catch (err) {
      console.error("Add candidate error:", err);
      throw err;
    }
  };

  // ======================================================
  // ADD APPLICATION
  // ======================================================
  const addApplication = async (payload: any) => {
    try {
      console.log('Creating application...', payload);

      const res = await fetch(API_ENDPOINTS.APPLICATIONS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend error:', res.status, errorText);
        throw new Error("Failed to create application");
      }

      const data = await res.json();
      console.log('Application created:', data);

      // Refresh applications after adding
      await fetchApplications();

      console.log('Applications refreshed after adding');
    } catch (err) {
      console.error("Add application error:", err);
      throw err;
    }
  };

  // ======================================================
  // UPDATE APPLICATION STATUS
  // ======================================================
  const updateApplicationStatus = async (applicationId: number, newStatus: string) => {
    try {
      const res = await fetch(
        `${buildApiUrl(API_ENDPOINTS.APPLICATIONS, applicationId)}/status?new_status=${newStatus}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Failed to update status");
      }

      // Refresh applications after update
      await fetchApplications();
      await fetchCandidates();
    } catch (err) {
      console.error("Update status error:", err);
      throw err;
    }
  };

  // ======================================================
  // INITIAL LOAD + AUTO-REFRESH
  // ======================================================
  useEffect(() => {
    // Initial load
    fetchJobs();
    fetchCandidates();
    fetchApplications();

    // Auto-refresh every 30 seconds to pick up new applications
    const refreshInterval = setInterval(() => {
      console.log('[DataContext] Auto-refreshing data...');
      fetchApplications();
      fetchCandidates();
      fetchJobs();
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(refreshInterval);
  }, []);

  return (
    <DataContext.Provider
      value={{
        jobs,
        candidates,
        applications,

        fetchJobs,
        fetchCandidates,
        fetchApplications,
        createJob,
        addCandidate,
        addApplication,
        updateApplicationStatus,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used inside DataProvider");
  return ctx;
}
