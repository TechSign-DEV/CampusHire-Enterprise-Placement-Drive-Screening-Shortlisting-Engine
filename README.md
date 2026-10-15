# CampusHire --- Enterprise Placement Drive Screening & Shortlisting Engine

CampusHire is a full-stack web application for campus recruitment and
placement management. It helps administrators and recruiters manage
placement drives, screen student eligibility, shortlist candidates,
schedule interviews, and monitor recruitment progress.

## Features

-   **Authentication and role-based access:** Admin, Recruiter, and
    Student roles with protected routes and APIs.
-   **Student management:** Academic profiles, department, graduation
    year, CGPA, backlogs, skills, and application status.
-   **Company management:** Company profiles, industry, website,
    location, and recruiter association.
-   **Placement drives:** Job details, package, deadlines, drive status,
    and eligibility criteria.
-   **Eligibility screening:** Evaluate academic criteria and coding
    scores; identify eligible and ineligible candidates.
-   **Applications:** Eligible students can apply and track `APPLIED`,
    `SHORTLISTED`, `REJECTED`, and `INTERVIEW_SCHEDULED` statuses.
-   **Interview scheduling:** Online/offline interviews, rounds, time
    slots, meeting links, and status updates.
-   **Email notifications:** Nodemailer integration with SMTP
    configuration.
-   **Analytics:** Students, companies, drives, applications,
    eligibility, shortlisting, and interview summaries.
-   **Reports and administration:** CSV exports and administrative user
    management.

## Technology Stack

**Frontend:** React.js, Vite, React Router, Axios, Bootstrap, CSS\
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, Nodemailer\
**Tools:** Visual Studio Code, npm, Postman, MongoDB Compass

## Project Structure

``` text
CampusHire/
├── backend/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
└── README.md
```

*This is a representative structure; adjust it to match the actual
project.*

## Prerequisites

-   Node.js and npm
-   Local MongoDB or MongoDB Atlas
-   A code editor such as Visual Studio Code

## Installation and Setup

### 1. Clone or open the project

``` bash
git clone <your-repository-url>
cd CampusHire
```

Replace `<your-repository-url>` with your repository URL. If the project
already exists locally, open its root directory instead.

### 2. Set up the backend

``` bash
cd backend
npm install
```

Create `backend/.env`:

``` env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/campushire
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Use the exact environment variable names required by your code.
Configure SMTP variables if email notifications are enabled. Do not
commit `.env` files.

Start the backend:

``` bash
node server.js
```

Expected backend URL: `http://localhost:5000`.

### 3. Set up the frontend

Open a second terminal:

``` bash
cd frontend
npm install
```

Create `frontend/.env`:

``` env
VITE_API_URL=http://localhost:5000/api
```

Ensure this matches the base URL used by your Axios configuration.

Start the frontend:

``` bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

## User Roles

  -----------------------------------------------------------------------
  Role                                Responsibilities
  ----------------------------------- -----------------------------------
  Admin                               Manage users and oversee
                                      recruitment activities.

  Recruiter                           Manage companies and drives, screen
                                      candidates, shortlist students, and
                                      schedule interviews.

  Student                             Maintain an academic profile, view
                                      drives, apply when eligible, and
                                      view interview schedules.
  -----------------------------------------------------------------------

Permissions depend on the application's implemented authorization rules.

## Application Workflow

1.  Users register and log in.
2.  Students complete their academic profiles.
3.  Recruiters create company profiles and placement drives.
4.  Recruiters or administrators run eligibility screening.
5.  Eligible students apply for drives.
6.  Recruiters review applications and shortlist candidates.
7.  Recruiters schedule interview batches and slots.
8.  Students view their interview schedules and meeting details.
9.  Recruiters update interview statuses.
10. Authorized users review analytics and export reports.

## Testing

Functional tests performed during development include:

-   Backend and frontend startup
-   Student registration and login
-   Role-based route protection
-   Student profile creation and persistence
-   Recruiter registration and login
-   Company profile creation
-   Placement drive creation and visibility
-   Eligible and ineligible screening results
-   Application submission after successful screening
-   Candidate shortlisting
-   Interview scheduling
-   Student interview schedule visibility
-   Interview status update to `COMPLETED`
-   Analytics dashboard loading

**Known verification item:** Analytics displayed inconsistencies between
shortlisted counts, scheduled interview counts, and application
statuses. Verify these figures against the underlying application and
interview records before considering analytics fully validated.

## Security Recommendations

-   Never commit `.env` files or production secrets.
-   Use a strong, randomly generated JWT secret.
-   Validate and sanitize request data.
-   Enforce authorization on backend routes.
-   Use HTTPS in production.
-   Restrict CORS to trusted frontend origins.
-   Use secure password hashing and appropriate token expiration.
-   Keep dependencies updated and restrict administrative actions.

## Future Enhancements

-   Resume upload and parsing
-   Coding assessment integration
-   Advanced candidate ranking
-   Calendar integration and interview reminders
-   Enhanced analytics and reports
-   Pagination, filtering, and search
-   Production deployment configuration

## License

Choose and document an appropriate license before distributing or
publishing the project.
