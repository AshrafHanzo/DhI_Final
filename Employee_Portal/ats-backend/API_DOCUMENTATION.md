# 📘 ATS Backend API Documentation

**Base URL:** `https://api.dhicreativeservices.com`  
**Interactive Docs:** [Swagger UI](https://api.dhicreativeservices.com/docs)  
**Alternative Docs:** [ReDoc](https://api.dhicreativeservices.com/redoc)

---

## 📋 Table of Contents

1. [Health Check](#health-check)
2. [Users API](#users-api)
3. [Companies API](#companies-api)
4. [Jobs API](#jobs-api)
5. [Candidates API](#candidates-api)
6. [Applications API](#applications-api)
7. [Dashboard API](#dashboard-api)
8. [Masters API](#masters-api)
9. [Admin API](#admin-api)

---

## 🏥 Health Check

### Check API Status
0I9H 
```http
GET https://api.dhicreativeservices.com/health
```

**Description:** Verify if the API server is running and database is connected.

**Response:**
```json
{
  "ok": true
}
```

---

## 👥 Users API

### 1. Create User

```http
POST https://api.dhicreativeservices.com/api/users/
```

**Description:** Register a new user in the system.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "your_password",
  "role": "admin"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Full name of the user |
| email | string | ✅ | Valid email address (unique) |
| password | string | ✅ | User password |
| role | string | ✅ | User role (e.g., "admin", "recruiter") |

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "admin",
  "is_active": true
}
```

**Errors:**
- `400`: Email already exists

---

### 2. User Login

```http
POST https://api.dhicreativeservices.com/api/users/login
```

**Description:** Authenticate a user and get their details.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "your_password"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

**Errors:**
- `400`: Invalid credentials

---

### 3. List All Users

```http
GET https://api.dhicreativeservices.com/api/users/
```

**Description:** Get a list of all registered users.

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin",
    "is_active": true
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "recruiter",
    "is_active": true
  }
]
```

---

### 4. Forgot Password

```http
POST https://api.dhicreativeservices.com/api/users/forgot-password
```

**Description:** Request a password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "If this email exists, a password reset link has been sent."
}
```

---

### 5. Reset Password

```http
POST https://api.dhicreativeservices.com/api/users/reset-password
```

**Description:** Reset password using a valid token.

**Request Body:**
```json
{
  "token": "your_reset_token",
  "password": "new_password"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully. You can now login with your new password."
}
```

**Errors:**
- `400`: Invalid or expired reset token
- `400`: Password must be at least 6 characters

---

## 🏢 Companies API

### 1. Create Company

```http
POST https://api.dhicreativeservices.com/api/companies/
```

**Description:** Add a new client company.

**Request Body:**
```json
{
  "name": "Kushals",
  "address": "123 Main Street, Koramangala",
  "city": "Bangalore",
  "pincode": "560034"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Company name (unique) |
| address | string | ✅ | Full address |
| city | string | ✅ | City name |
| pincode | string | ✅ | Postal code |

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Kushals",
  "address": "123 Main Street, Koramangala",
  "city": "Bangalore",
  "pincode": "560034",
  "created_at": "2026-01-13T10:30:00"
}
```

**Errors:**
- `400`: Company already exists

---

### 2. List All Companies

```http
GET https://api.dhicreativeservices.com/api/companies/
```

**Description:** Get all registered companies.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Kushals",
    "address": "123 Main Street, Koramangala",
    "city": "Bangalore",
    "pincode": "560034",
    "created_at": "2026-01-13T10:30:00"
  }
]
```

---

### 3. Get Company by ID

```http
GET https://api.dhicreativeservices.com/api/companies/{company_id}
```

**Description:** Get details of a specific company.

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| company_id | integer | ✅ | Company ID |

**Example:**
```http
GET https://api.dhicreativeservices.com/api/companies/1
```

**Response:**
```json
{
  "id": 1,
  "name": "Kushals",
  "address": "123 Main Street, Koramangala",
  "city": "Bangalore",
  "pincode": "560034",
  "created_at": "2026-01-13T10:30:00"
}
```

**Errors:**
- `404`: Company not found

---

## 💼 Jobs API

### 1. Create Job

```http
POST https://api.dhicreativeservices.com/api/jobs/
```

**Description:** Create a new job posting.

**Request Body:**
```json
{
  "company_id": 1,
  "company_name": "Kushals",
  "job_title": "Store Manager",
  "job_description": "Looking for an experienced store manager...",
  "address": "Koramangala, Bangalore",
  "openings": 3,
  "type": "Full-time",
  "work_mode": "Onsite",
  "salary_min": 25000,
  "salary_max": 40000,
  "status": "Active",
  "urgency": "High",
  "commission": 2000,
  "tenure": "Permanent",
  "shift": "Day",
  "category": "Retail",
  "experience": 2,
  "age_min": 22,
  "age_max": 35,
  "required_skills": "Sales, Customer Service",
  "preferred_skills": "Leadership, Inventory Management",
  "nice_to_have": "Retail experience",
  "languages_required": "English, Hindi, Kannada",
  "seo_keywords": "store manager, retail, kushals",
  "posted_by": 1
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| company_id | integer | ✅ | ID of the company |
| company_name | string | ❌ | Company name (optional) |
| job_title | string | ✅ | Job title |
| job_description | string | ✅ | Full job description |
| address | string | ✅ | Job location |
| openings | integer | ❌ | Number of positions (default: 1) |
| type | string | ❌ | Employment type (Full-time, Part-time, Contract) |
| work_mode | string | ❌ | Work mode (Onsite, Remote, Hybrid) |
| salary_min | integer | ❌ | Minimum salary |
| salary_max | integer | ❌ | Maximum salary |
| status | string | ❌ | Job status (Active, Closed, On Hold) |
| urgency | string | ❌ | Priority level |
| commission | integer | ❌ | Commission amount |
| tenure | string | ❌ | Tenure period |
| shift | string | ❌ | Shift timing |
| category | string | ❌ | Job category |
| experience | integer | ❌ | Years of experience required |
| age_min | integer | ❌ | Minimum age requirement |
| age_max | integer | ❌ | Maximum age requirement |
| required_skills | string | ❌ | Required skills |
| preferred_skills | string | ❌ | Preferred skills |
| nice_to_have | string | ❌ | Nice-to-have skills |
| languages_required | string | ❌ | Required languages |
| seo_keywords | string | ❌ | SEO keywords |
| posted_by | integer | ✅ | User ID who posted |

**Response (201 Created):**
```json
{
  "id": 1,
  "company_id": 1,
  "company_name": "Kushals",
  "job_title": "Store Manager",
  "job_description": "Looking for an experienced store manager...",
  "address": "Koramangala, Bangalore",
  "openings": 3,
  "type": "Full-time",
  "work_mode": "Onsite",
  "salary_min": 25000,
  "salary_max": 40000,
  "status": "Active",
  "urgency": "High",
  "commission": 2000,
  "tenure": "Permanent",
  "shift": "Day",
  "category": "Retail",
  "experience": 2,
  "age_min": 22,
  "age_max": 35,
  "required_skills": "Sales, Customer Service",
  "preferred_skills": "Leadership, Inventory Management",
  "nice_to_have": "Retail experience",
  "languages_required": "English, Hindi, Kannada",
  "seo_keywords": "store manager, retail, kushals",
  "posted_by": 1,
  "created_at": "2026-01-13T10:30:00",
  "updated_at": "2026-01-13T10:30:00"
}
```

---

### 2. List All Jobs

```http
GET https://api.dhicreativeservices.com/api/jobs/
```

**Description:** Get all job postings.

**Response:**
```json
[
  {
    "id": 1,
    "company_id": 1,
    "company_name": "Kushals",
    "job_title": "Store Manager",
    "job_description": "...",
    "address": "Koramangala, Bangalore",
    "openings": 3,
    "type": "Full-time",
    "work_mode": "Onsite",
    "salary_min": 25000,
    "salary_max": 40000,
    "status": "Active",
    "created_at": "2026-01-13T10:30:00",
    "updated_at": "2026-01-13T10:30:00"
  }
]
```

---

### 3. Get Job by ID

```http
GET https://api.dhicreativeservices.com/api/jobs/{job_id}
```

**Description:** Get details of a specific job.

**Example:**
```http
GET https://api.dhicreativeservices.com/api/jobs/1
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| job_id | integer | ✅ | Job ID |

**Response:** Same structure as create response.

**Errors:**
- `404`: Job not found

---

### 4. Update Job

```http
PUT https://api.dhicreativeservices.com/api/jobs/{job_id}
```

**Description:** Update a job posting (partial update supported).

**Example:**
```http
PUT https://api.dhicreativeservices.com/api/jobs/1
```

**Request Body:** (Only fields to update)
```json
{
  "status": "Closed",
  "openings": 0
}
```

**Response:** Updated job object.

**Errors:**
- `404`: Job not found
- `400`: No fields to update

---

## 👤 Candidates API

### 1. Create Candidate

```http
POST https://api.dhicreativeservices.com/api/candidates/
Content-Type: multipart/form-data
```

**Description:** Create a new candidate profile (with optional resume upload and automatic job application).

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | ✅ | Candidate's full name |
| phone_number | string | ✅ | Phone number |
| email_address | string | ❌ | Email address |
| gender | string | ❌ | Gender (Male/Female/Other) |
| city | string | ✅ | City |
| job_id | integer | ❌ | If provided, creates an application |
| sourced_from | string | ❌ | Source of the candidate |
| resume | file | ❌ | Resume file (PDF, DOC, DOCX) |
| resume_url | string | ❌ | URL to resume if not uploading |

**Example cURL:**
```bash
curl -X POST "https://api.dhicreativeservices.com/api/candidates/" \
  -H "Content-Type: multipart/form-data" \
  -F "full_name=Rahul Kumar" \
  -F "phone_number=9876543210" \
  -F "email_address=rahul@example.com" \
  -F "gender=Male" \
  -F "city=Bangalore" \
  -F "job_id=1" \
  -F "sourced_from=Meta" \
  -F "resume=@/path/to/resume.pdf"
```

**Response:**
```json
{
  "id": 1,
  "full_name": "Rahul Kumar",
  "phone_number": "9876543210",
  "email_address": "rahul@example.com",
  "gender": "Male",
  "city": "Bangalore",
  "resume_url": "/uploads/1736765400_resume.pdf",
  "status": "new",
  "created_at": "2026-01-13T10:30:00",
  "updated_at": "2026-01-13T10:30:00"
}
```

---

### 2. Landing Page Application (Simplified)

```http
POST https://api.dhicreativeservices.com/api/candidates/landing-page
Content-Type: multipart/form-data
```

**Description:** Simplified endpoint for landing page job applications from Meta/Facebook campaigns. Automatically creates candidate, application, and screening entries.

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| full_name | string | ✅ | Candidate's full name |
| phone | string | ✅ | Phone number |
| email | string | ❌ | Email address |
| city | string | ✅ | City |
| position | string | ✅ | Position applied for |
| source | string | ❌ | Source (default: "Meta") |
| job_id | string | ❌ | Job ID if applying to specific job |
| company | string | ❌ | Company name |
| resume | file | ❌ | Resume file |

**Response:**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "candidate_id": 1,
  "application_id": 1,
  "data": {
    "candidate": {
      "id": 1,
      "full_name": "Rahul Kumar",
      "phone_number": "9876543210",
      "email_address": "rahul@example.com",
      "city": "Bangalore",
      "created_at": "2026-01-13T10:30:00"
    },
    "application": {
      "id": 1,
      "candidate_id": 1,
      "job_id": 1,
      "candidate_name": "Rahul Kumar",
      "job_title": "Store Manager",
      "company": "Kushals",
      "status": "Applied",
      "sourced_from": "Meta",
      "screening_status": "Applied"
    }
  }
}
```

---

### 3. List All Candidates

```http
GET https://api.dhicreativeservices.com/api/candidates/
```

**Description:** Get all candidates in the database.

**Response:**
```json
[
  {
    "id": 1,
    "full_name": "Rahul Kumar",
    "fathers_name": null,
    "phone_number": "9876543210",
    "email_address": "rahul@example.com",
    "date_of_birth": null,
    "gender": "Male",
    "aadhaar_number": null,
    "street_address": null,
    "area_locality": null,
    "city": "Bangalore",
    "pincode": null,
    "select_languages": "",
    "educational_quality": null,
    "work_experience": "",
    "additional_months": "",
    "technical_professional_skills": null,
    "preferred_industries_categories": null,
    "preferred_employment_types": "",
    "preferred_work_types": null,
    "status": "new",
    "resume_url": "/uploads/1736765400_resume.pdf",
    "created_at": "2026-01-13T10:30:00",
    "updated_at": "2026-01-13T10:30:00"
  }
]
```

---

### 4. Get Candidate by ID

```http
GET https://api.dhicreativeservices.com/api/candidates/{candidate_id}
```

**Example:**
```http
GET https://api.dhicreativeservices.com/api/candidates/1
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| candidate_id | integer | ✅ | Candidate ID |

**Errors:**
- `404`: Candidate not found

---

### 5. Update Candidate (Full)

```http
PUT https://api.dhicreativeservices.com/api/candidates/{candidate_id}
Content-Type: multipart/form-data
```

**Example:**
```http
PUT https://api.dhicreativeservices.com/api/candidates/1
```

**Description:** Update all candidate fields (form-data format).

**Form Fields:** Same as create, with additional fields:

| Field | Type | Description |
|-------|------|-------------|
| fathers_name | string | Father's name |
| date_of_birth | string | Date of birth (YYYY-MM-DD) |
| aadhaar_number | string | Aadhaar number |
| street_address | string | Street address |
| area_locality | string | Area/locality |
| pincode | string | Pincode |
| select_languages | string | Languages known |
| educational_quality | string | Education qualification |
| work_experience | string | Years of experience |
| additional_months | string | Additional months of experience |
| technical_professional_skills | string | Technical skills |
| preferred_industries_categories | string | Preferred industries |
| preferred_employment_types | string | Preferred employment types |
| preferred_work_types | string | Preferred work types |
| status | string | Status (new, active, etc.) |

---

### 6. Update Candidate (Partial - JSON)

```http
PATCH https://api.dhicreativeservices.com/api/candidates/{candidate_id}
Content-Type: application/json
```

**Example:**
```http
PATCH https://api.dhicreativeservices.com/api/candidates/1
```

**Description:** Partial update using JSON body. Only provided fields are updated.

**Request Body:**
```json
{
  "city": "Chennai",
  "status": "active"
}
```

**Response:** Updated candidate object.

---

### 7. Delete Candidate

```http
DELETE https://api.dhicreativeservices.com/api/candidates/{candidate_id}
```

**Example:**
```http
DELETE https://api.dhicreativeservices.com/api/candidates/1
```

**Description:** Delete a candidate and all associated applications.

**Response:**
```json
{
  "message": "Candidate deleted successfully",
  "id": 1
}
```

**Errors:**
- `404`: Candidate not found

---

## 📄 Applications API

### 1. Create Application

```http
POST https://api.dhicreativeservices.com/api/applications/
Content-Type: application/json
```

**Description:** Create a new job application.

**Request Body:**
```json
{
  "candidate_id": 1,
  "job_id": 1,
  "candidate_name": "Rahul Kumar",
  "job_title": "Store Manager",
  "company": "Kushals",
  "status": "Applied",
  "sourced_by": "Muni Divya",
  "sourced_from": "Meta",
  "assigned_to": "Surya K",
  "applied_on": "2026-01-13",
  "comments": "Good candidate"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| candidate_id | integer | ❌ | Candidate ID |
| job_id | integer | ❌ | Job ID |
| candidate_name | string | ✅ | Candidate's name |
| job_title | string | ✅ | Job title |
| company | string | ❌ | Company name |
| status | string | ❌ | Status (default: "Applied") |
| sourced_by | string | ❌ | Recruiter who sourced |
| sourced_from | string | ❌ | Source (Meta, LinkedIn, etc.) |
| assigned_to | string | ❌ | Assigned recruiter |
| applied_on | date | ❌ | Application date |
| comments | string | ❌ | Comments/notes |
| screening_status | string | ❌ | Screening status |
| interview_status | string | ❌ | Interview status |
| interview_date | date | ❌ | Interview date |
| joined_status | string | ❌ | Joining status |
| joining_date | date | ❌ | Joining date |

**Response:**
```json
{
  "id": 1,
  "candidate_id": 1,
  "job_id": 1,
  "candidate_name": "Rahul Kumar",
  "job_title": "Store Manager",
  "company": "Kushals",
  "status": "Applied",
  "sourced_by": "Muni Divya",
  "sourced_from": "Meta",
  "assigned_to": "Surya K",
  "applied_on": "2026-01-13",
  "comments": "Good candidate",
  "screening_status": null,
  "created_at": "2026-01-13T10:30:00",
  "updated_at": "2026-01-13T10:30:00"
}
```

---

### 2. List All Applications

```http
GET https://api.dhicreativeservices.com/api/applications/
```

**Description:** Get all applications with candidate and job details (JOINed data).

**Response:**
```json
[
  {
    "id": 1,
    "candidate_id": 1,
    "job_id": 1,
    "candidate_name": "Rahul Kumar",
    "job_title": "Store Manager",
    "company": "Kushals",
    "status": "Applied",
    "sourced_by": "Muni Divya",
    "sourced_from": "Meta",
    "assigned_to": "Surya K",
    "applied_on": "2026-01-13",
    "comments": "Good candidate",
    "screening_status": "Ready To Interview",
    "interview_status": null,
    "interview_date": null,
    "joined_status": null,
    "joining_date": null,
    "created_at": "2026-01-13T10:30:00",
    "updated_at": "2026-01-13T10:30:00",
    "candidate_phone": "9876543210",
    "candidate_city": "Bangalore",
    "candidate_gender": "Male",
    "job_location": "Koramangala, Bangalore",
    "job_salary": "₹25000 - ₹40000",
    "job_commission": 2000,
    "job_tenure": "Permanent"
  }
]
```

---

### 3. Get Application by ID

```http
GET https://api.dhicreativeservices.com/api/applications/{application_id}
```

**Example:**
```http
GET https://api.dhicreativeservices.com/api/applications/1
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| application_id | integer | ✅ | Application ID |

**Errors:**
- `404`: Application not found

---

### 4. Update Application (Flexible)

```http
PUT https://api.dhicreativeservices.com/api/applications/{application_id}
Content-Type: application/json
```

**Example:**
```http
PUT https://api.dhicreativeservices.com/api/applications/1
```

**Description:** Update any application field.

**Request Body:**
```json
{
  "screening_status": "Ready To Interview",
  "assigned_to": "Nandhini Kumaravel",
  "comments": "Scheduled for interview"
}
```

**Allowed Fields:**
- status
- sourced_by
- sourced_from
- assigned_to
- applied_on
- comments
- candidate_name
- job_title
- company
- screening_status
- interview_status
- interview_date
- joined_status
- joining_date

**Response:** Updated application object.

---

### 5. Update Application Status (Pipeline)

```http
PUT https://api.dhicreativeservices.com/api/applications/{application_id}/status?new_status=Shortlisted
```

**Example:**
```http
PUT https://api.dhicreativeservices.com/api/applications/1/status?new_status=Shortlisted
```

**Description:** Move application through the hiring pipeline.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| new_status | string | ✅ | New pipeline status |

**Pipeline Flow:**
```
Applied → Shortlisted → Interview → Selected → Joined → Tenure Completed
```

**Errors:**
- `400`: Invalid transition (e.g., Applied → Selected)
- `404`: Application not found

---

### 6. Delete Application

```http
DELETE https://api.dhicreativeservices.com/api/applications/{application_id}
```

**Example:**
```http
DELETE https://api.dhicreativeservices.com/api/applications/1
```

**Response:**
```json
{
  "message": "Application deleted successfully",
  "id": 1
}
```

---

## 📊 Dashboard API

### 1. Get Dashboard Stats

```http
GET https://api.dhicreativeservices.com/api/dashboard/
```

**Description:** Get comprehensive ATS statistics for the dashboard.

**Response:**
```json
{
  "total_users": 5,
  "total_companies": 10,
  "total_jobs": 25,
  "total_candidates": 150,
  "total_applications": 200,
  "jobs_open": 20,
  "jobs_closed": 3,
  "jobs_on_hold": 2,
  "applications_today": 15,
  "applications_yesterday": 12,
  "candidates_today": 10,
  "candidates_yesterday": 8,
  "screening_applied": 50,
  "screening_callback": 20,
  "screening_not_reachable": 15,
  "screening_wrong_number": 5,
  "screening_ringing": 10,
  "screening_ready": 45,
  "screening_not_fit": 20,
  "screening_not_interested": 35,
  "interview_scheduled": 30,
  "interview_attended": 25,
  "interview_not_attended": 5,
  "interview_selected": 20,
  "interview_rejected": 5,
  "joined_count": 15,
  "not_joined_count": 5,
  "applications_this_week": 80,
  "candidates_this_week": 60
}
```

---

### 2. Get Recruiter Stats

```http
GET https://api.dhicreativeservices.com/api/dashboard/recruiter-stats?period=all
```

**Description:** Get application counts per recruiter.

**Query Parameters:**
| Parameter | Type | Required | Options |
|-----------|------|----------|---------|
| period | string | ❌ | all, today, week, month, year |

**Examples:**
```http
GET https://api.dhicreativeservices.com/api/dashboard/recruiter-stats?period=today
GET https://api.dhicreativeservices.com/api/dashboard/recruiter-stats?period=week
GET https://api.dhicreativeservices.com/api/dashboard/recruiter-stats?period=month
```

**Response:**
```json
[
  {
    "recruiter": "Muni Divya",
    "total_applications": 50,
    "ready_to_interview": 20,
    "selected": 10,
    "joined": 5
  },
  {
    "recruiter": "Surya K",
    "total_applications": 45,
    "ready_to_interview": 18,
    "selected": 8,
    "joined": 4
  },
  {
    "recruiter": "Organic (Unassigned)",
    "total_applications": 30,
    "ready_to_interview": 10,
    "selected": 5,
    "joined": 2
  }
]
```

---

### 3. Get Weekly Trend

```http
GET https://api.dhicreativeservices.com/api/dashboard/weekly-trend
```

**Description:** Get daily application counts for the last 7 days.

**Response:**
```json
[
  {"date": "2026-01-07", "count": 10},
  {"date": "2026-01-08", "count": 15},
  {"date": "2026-01-09", "count": 12},
  {"date": "2026-01-10", "count": 18},
  {"date": "2026-01-11", "count": 20},
  {"date": "2026-01-12", "count": 14},
  {"date": "2026-01-13", "count": 16}
]
```

---

## 📋 Masters API

### 1. Get Sourced From Options

```http
GET https://api.dhicreativeservices.com/api/masters/sourced-from
```

**Description:** Get all active "Sourced From" options.

**Response:**
```json
[
  {"id": 1, "source_name": "Meta", "display_order": 1},
  {"id": 2, "source_name": "LinkedIn", "display_order": 2},
  {"id": 3, "source_name": "Indeed", "display_order": 3},
  {"id": 4, "source_name": "Naukri", "display_order": 4}
]
```

---

### 2. Add Sourced From Option

```http
POST https://api.dhicreativeservices.com/api/masters/sourced-from?source_name=NewSource
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| source_name | string | ✅ | Name of the source |

---

## ⚙️ Admin API

### Recruiters

#### Get All Recruiters
```http
GET https://api.dhicreativeservices.com/api/admin/recruiters
```

**Response:**
```json
[
  {"id": 1, "name": "Muni Divya", "is_active": true, "created_at": "..."},
  {"id": 2, "name": "Surya K", "is_active": true, "created_at": "..."}
]
```

#### Create Recruiter
```http
POST https://api.dhicreativeservices.com/api/admin/recruiters
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Recruiter"
}
```

#### Update Recruiter
```http
PUT https://api.dhicreativeservices.com/api/admin/recruiters/{recruiter_id}
Content-Type: application/json
```

**Example:**
```http
PUT https://api.dhicreativeservices.com/api/admin/recruiters/1
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "is_active": false
}
```

#### Delete Recruiter
```http
DELETE https://api.dhicreativeservices.com/api/admin/recruiters/{recruiter_id}
```

**Example:**
```http
DELETE https://api.dhicreativeservices.com/api/admin/recruiters/1
```

---

### Screening Statuses

#### Get All Screening Statuses
```http
GET https://api.dhicreativeservices.com/api/admin/screening-statuses
```

**Default Statuses:**
- Applied
- Call Back
- Not Reachable
- Wrong Number
- Ringing No Response
- Ready To Interview
- Not Fit
- Not Interested
- Blacklisted

#### Create Screening Status
```http
POST https://api.dhicreativeservices.com/api/admin/screening-statuses
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Status",
  "display_order": 10
}
```

#### Update Screening Status
```http
PUT https://api.dhicreativeservices.com/api/admin/screening-statuses/{status_id}
```

**Example:**
```http
PUT https://api.dhicreativeservices.com/api/admin/screening-statuses/1
```

#### Delete Screening Status
```http
DELETE https://api.dhicreativeservices.com/api/admin/screening-statuses/{status_id}
```

**Example:**
```http
DELETE https://api.dhicreativeservices.com/api/admin/screening-statuses/1
```

---

### Sourced From

```http
GET    https://api.dhicreativeservices.com/api/admin/sourced-from
POST   https://api.dhicreativeservices.com/api/admin/sourced-from
PUT    https://api.dhicreativeservices.com/api/admin/sourced-from/{item_id}
DELETE https://api.dhicreativeservices.com/api/admin/sourced-from/{item_id}
```

---

### Interview Statuses

```http
GET    https://api.dhicreativeservices.com/api/admin/interview-statuses
POST   https://api.dhicreativeservices.com/api/admin/interview-statuses
PUT    https://api.dhicreativeservices.com/api/admin/interview-statuses/{item_id}
DELETE https://api.dhicreativeservices.com/api/admin/interview-statuses/{item_id}
```

**Default Interview Statuses:**
- Scheduled
- Attended
- Not Attended
- Selected
- Rejected

---

### Joined Statuses

```http
GET    https://api.dhicreativeservices.com/api/admin/joined-statuses
POST   https://api.dhicreativeservices.com/api/admin/joined-statuses
PUT    https://api.dhicreativeservices.com/api/admin/joined-statuses/{item_id}
DELETE https://api.dhicreativeservices.com/api/admin/joined-statuses/{item_id}
```

**Default Joined Statuses:**
- Joined
- Left
- Not Joined

---

### Ready to Interview Statuses

```http
GET    https://api.dhicreativeservices.com/api/admin/ready-to-interview-statuses
POST   https://api.dhicreativeservices.com/api/admin/ready-to-interview-statuses
PUT    https://api.dhicreativeservices.com/api/admin/ready-to-interview-statuses/{item_id}
DELETE https://api.dhicreativeservices.com/api/admin/ready-to-interview-statuses/{item_id}
```

**Default Statuses:**
- Pending
- Scheduled
- Not Attended
- Rejected

---

## 🔗 For RPA Integration (EarlyJobs)

### Syncing Status Updates to EarlyJobs (RPA)

The API provides a "Sync Flag" mechanism to instantly find applications that have changed.

#### 1. Fetch Pending Syncs
The RPA bot should poll this endpoint (e.g., every 1-5 minutes) to get **only** the applications that have changed status.

```http
GET https://api.dhicreativeservices.com/api/applications/pending-sync
```

**Response:**
```json
[
  {
    "id": 101,
    "candidate_id": 55,
    "status": "Interview",
    "screening_status": "Scheduled",
    "interview_status": null,
    "joined_status": null,
    "candidate_name": "Rahul Kumar",
    "job_title": "Store Manager",
    "updated_at": "2026-01-24T12:05:00"
  }
]
```

#### 2. Process & Acknowledge
After the RPA updates EarlyJobs with the new status, it **must acknowledge** the sync to clear the flag.

```http
POST https://api.dhicreativeservices.com/api/applications/ack-sync
Content-Type: application/json
```

**Request Body:**
```json
{
  "application_ids": [101]
}
```

**Response:**
```json
{
  "message": "Sync acknowledged",
  "count": 1
}
```

### Example RPA Script (Python)

```python
import requests
import time

def sync_rpa():
    # 1. Fetch pending updates
    resp = requests.get("https://api.dhicreativeservices.com/api/applications/pending-sync")
    pending_apps = resp.json()
    
    if not pending_apps:
        print("No updates pending.")
        return

    processed_ids = []

    # 2. Process each update
    for app in pending_apps:
        try:
            print(f"Syncing App ID {app['id']} - Status: {app['status']} / {app['screening_status']}")
            
            # TODO: Add your RPA logic here to update EarlyJobs
            # rpa.update_status(app['candidate_name'], app['status'])
            
            processed_ids.append(app['id'])
        except Exception as e:
            print(f"Failed to sync ID {app['id']}: {e}")

    # 3. Acknowledge success
    if processed_ids:
        requests.post(
            "https://api.dhicreativeservices.com/api/applications/ack-sync",
            json={"application_ids": processed_ids}
        )
        print(f"Successfully synced {len(processed_ids)} records.")

# Run sync check
sync_rpa()
```

---

## 📝 Error Responses

All endpoints may return these standard error responses:

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input or duplicate data |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error - Database or server error |

**Error Response Format:**
```json
{
  "detail": "Error message describing what went wrong"
}
```

---

## 🧪 Testing the API

1. **Swagger UI (Recommended):** https://api.dhicreativeservices.com/docs
2. **ReDoc:** https://api.dhicreativeservices.com/redoc
3. **Health Check:** https://api.dhicreativeservices.com/health

---

**Documentation Generated:** January 13, 2026  
**API Version:** 1.0.0  
**Created by:** WorkBooster AI Solutions
