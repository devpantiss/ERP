# Pantiss ERP

Pantiss ERP is a role-based React and Vite application for program delivery, training, placement, HR entitlement, approvals, finance, live monitoring, and client reporting.

## Role-Based App Flow

```mermaid
flowchart TD
    Home["Public Website<br/>/"] --> StaffLogin["Staff Login<br/>role selector"]
    Home --> ClientLogin["Client Login<br/>/client-login"]
    Home --> PublicLive["Public Live Feed Viewer<br/>/live/:sessionId"]

    StaffLogin --> SuperAdmin["Super Admin Console<br/>/super-admin"]
    StaffLogin --> Admin["Admin Hub<br/>/admin"]
    StaffLogin --> Mobilizer["Mobilize Hub<br/>/mobilizer"]
    StaffLogin --> Trainer["Teach Hub<br/>/trainer"]
    StaffLogin --> Placement["Placement Console<br/>/placement-officer"]

    ClientLogin --> ClientGuard{"clientSession in localStorage?"}
    ClientGuard -->|yes| ClientPortal["Client Portal<br/>/client"]
    ClientGuard -->|no| ClientLogin

    SuperAdmin --> GlobalControls["Global oversight<br/>access, projects, finance, approvals"]
    Admin --> ProjectOps["Project operations<br/>employees, invoices, live feed, approvals"]
    Mobilizer --> Mobilization["Field mobilization<br/>community engagement and enrollment"]
    Trainer --> Training["Training delivery<br/>teaching, exposure visits, testimonials"]
    Placement --> PlacementOps["Placement operations<br/>companies, openings, drives, placement list"]
    ClientPortal --> ClientReports["Client reporting<br/>projects, reports, success story, live feed"]

    Mobilization --> ProjectOps
    Training --> ProjectOps
    PlacementOps --> ProjectOps
    ProjectOps --> GlobalControls
    ClientReports --> GlobalControls
```

## Operational Flow By Role

```mermaid
flowchart LR
    subgraph FieldDelivery["Field Delivery Roles"]
        MobilizerRole["Mobilizer"] --> MobilizerCommunity["Community Engagement"]
        MobilizerRole --> MobilizerEnrollment["Candidate Enrollment"]
        MobilizerRole --> MobilizerHR["HR Entitlement"]
        MobilizerRole --> MobilizerGrievance["Grievance Portal"]

        TrainerRole["Trainer"] --> TrainerTeaching["Teaching Management"]
        TrainerRole --> TrainerExposure["Exposure Visits"]
        TrainerRole --> TrainerTestimonials["Testimonials"]
        TrainerRole --> TrainerHR["HR Entitlement"]
        TrainerRole --> TrainerGrievance["Grievance Portal"]
    end

    subgraph PlacementDelivery["Placement Role"]
        PlacementRole["Placement Officer"] --> CompanyDatabase["Company Database"]
        PlacementRole --> JobOpenings["Opening Dashboard"]
        PlacementRole --> PlacementDrives["Placement Drives"]
        PlacementRole --> PlacementList["Placement List"]
        PlacementRole --> PlacementHR["HR Entitlement"]
        PlacementRole --> PlacementGrievance["Grievance Portal"]
    end

    subgraph Governance["Governance Roles"]
        AdminRole["Admin"] --> AdminProjects["Project Details"]
        AdminRole --> AdminInvoices["Invoices"]
        AdminRole --> AdminLiveFeed["Live Feed"]
        AdminRole --> AdminApprovals["Approvals"]
        AdminRole --> AdminEmployees["Employee List"]
        AdminRole --> AdminHR["HR Entitlement"]

        SuperAdminRole["Super Admin"] --> SuperProjects["Projects and Certification"]
        SuperAdminRole --> SuperAccess["Access Control"]
        SuperAdminRole --> SuperApprovals["Approvals"]
        SuperAdminRole --> SuperFinance["Finance and Insurance"]
        SuperAdminRole --> SuperTracking["Global Tracking"]
    end

    subgraph ClientView["Client Role"]
        ClientRole["Client"] --> ClientProjects["Projects"]
        ClientRole --> ClientReports["Reports"]
        ClientRole --> ClientSuccess["Success Story"]
        ClientRole --> ClientLive["Live Feed"]
    end

    MobilizerCommunity --> AdminApprovals
    MobilizerEnrollment --> AdminApprovals
    TrainerTeaching --> AdminLiveFeed
    TrainerExposure --> AdminApprovals
    JobOpenings --> AdminApprovals
    PlacementDrives --> AdminApprovals
    AdminProjects --> SuperTracking
    AdminInvoices --> SuperApprovals
    AdminApprovals --> SuperApprovals
    SuperProjects --> ClientRole
```

## Role Route Map

| Role | Scope | Entry route | Primary flows |
| --- | --- | --- | --- |
| Super Admin | Global | `/super-admin/dashboard` | Projects, batch certification, live feed, approvals, grievances, finance, insurance, access control, user management, project creation, settings |
| Admin | Project | `/admin/dashboard` | Project details, invoices, live feed, approvals, employee list, HR entitlement, testimonials, profile |
| Mobilizer | Center | `/mobilizer/dashboard` | Community engagement, candidate enrollment, attendance, leave, tour, salary, reimbursement, grievances, profile |
| Trainer | Batch | `/trainer/dashboard` | Teaching management, exposure visits, testimonials, leave, salary, reimbursement, grievances, profile |
| Placement Officer | Project | `/placement-officer/dashboard` | Company database, opening dashboard, placement drives, placement list, testimonials, attendance, leave, tour, salary, reimbursement, grievances, profile |
| Client | Project | `/client/dashboard` | Dashboard, projects, reports, success story, live feed |
| Executive | Global | Not routed in `src/App.jsx` | Role exists in mock auth and access-control data, but no active UI route is currently wired |

## End-To-End Program Lifecycle

```mermaid
flowchart LR
    SA["Super Admin<br/>creates projects and access"] --> ADM["Admin<br/>manages project operations"]
    ADM --> MOB["Mobilizer<br/>runs outreach and enrollment"]
    MOB --> TRN["Trainer<br/>delivers training and exposure visits"]
    TRN --> PLC["Placement Officer<br/>manages openings, drives, and placements"]
    PLC --> CL["Client<br/>reviews project performance"]
    ADM --> APP["Admin approvals<br/>tour, leave, salary, reimbursement, operations"]
    APP --> FIN["Finance and compliance<br/>invoices, salary, insurance, reimbursement"]
    FIN --> SA
    CL --> SA
```

## Shared Workflows

- **HR Entitlement:** Attendance, leave, tour, salary, and reimbursement are shared across eligible staff roles.
- **Grievance:** Mobilizer, Trainer, and Placement Officer submit or track grievances; Admin and Super Admin monitor escalations.
- **Approvals:** Admin handles project-level approvals; Super Admin handles global approvals, finance checks, and oversight.
- **Live Feed:** Trainer can host or expose monitoring sessions; Admin, Super Admin, Client, and public live routes can view live feeds.
- **Client Access:** Client users sign in through `/client-login`; protected client routes require a `clientSession` value in `localStorage`.

## Source Of Truth

This flow is based on:

- `src/App.jsx`
- `src/components/Sidebars/*Sidebar.jsx`
- `src/components/Layout/ClientLayout.jsx`
- `src/pages/Client/ClientProtectedRoute.jsx`
- `src/mock-db/auth/index.js`
- `src/mock-db/shared/enums.js`

## Development

```bash
npm install
npm run dev
```
