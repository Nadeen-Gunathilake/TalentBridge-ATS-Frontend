# TalentBridge ATS — Frontend

A React app that sits on top of the Spring Boot backend. One codebase, two experiences — a public careers site where candidates browse jobs and track their applications, and a recruiter dashboard where recruiters post jobs and move applicants through the hiring pipeline.

**Live Demo:**[talentbridge-ats.up.railway.app](talentbridge-ats.up.railway.app)

## Strongest decisions

**Candidate and recruiter never share a view.** `CandidateLayout` and `RecruiterLayout` are two separate shells with their own nav. More importantly, the *data* is separated at the type level, not just the UI — the candidate's own application type (`CandidateApplication`) has no field for rating, notes, or candidate identity, because the backend never sends those to a candidate in the first place. There's nothing to accidentally leak because there's nowhere for it to live on the candidate side.

**Route protection doesn't just hide things — it never renders them.** `ProtectedRoute` checks the logged-in user's role *before* rendering anything, using a redirect during render (`<Navigate>`) instead of an effect that fires after the first paint. That distinction matters: a naive guard still flashes the protected page for one frame before redirecting. This one doesn't. A candidate typing `/recruiter` directly gets sent away immediately, not shown the page and then kicked out.

**Pipeline rules live in one file.** `src/pipeline/pipelineRules.ts` is the only place that knows what a legal next stage is. It mirrors the backend's actual transition rules (`APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW → OFFER → HIRED`, with `REJECTED` reachable from anywhere non-terminal, and `WITHDRAWN` reachable only by the candidate, never a recruiter). The applicant review screen asks this file what buttons to show — it never lists every status and hopes the server catches a bad one.

## Stack

React + TypeScript + Vite, React Router, Axios, Tailwind CSS.

## Running it locally

**1. Start the backend**, then:

```bash
cp .env.example .env
npm install
npm run dev
```

`.env` should point `VITE_API_BASE_URL` at your backend's origin — no `/api` suffix, since `/auth` sits outside `/api` on this backend.

```bash
npm run build   # type-checks then builds
npm run lint
npm run test
```

## Seeded recruiter login

`hr@talentbridge.com` / whatever `ADMIN_PASSWORD` is set to in the backend's environment.In production recruiter login is `hr@talentbridge.com` and admin password is `Hr@123`.
To access the project in production - [Click Here](talentbridge-ats.up.railway.app).

## Roles

- **Candidate** — self-registers. Registering does *not* log you in (the backend returns no token from `/auth/register`), so you land on the login page after signing up. Browses and searches jobs, applies once per job with an optional cover note and resume, tracks and withdraws their own applications.
- **Recruiter** — accounts are seeded and can be made by other recruiters, not self-registered. Posts, edits, opens and closes jobs, reviews applicants, rates them, leaves notes, and advances them through the pipeline.

Jobs aren't scoped to the recruiter who posted them — any recruiter can see and manage any job. This is deliberate since this is a single-company ATS.