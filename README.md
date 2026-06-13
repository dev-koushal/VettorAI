# Vettor AI

Vettor AI is an AI-powered interview preparation platform that helps candidates practice realistic technical interviews, analyze resumes, measure performance, and refine their answers with targeted feedback.

It combines a React frontend, an Express/MongoDB backend, Firebase authentication, and Razorpay payments to deliver a full interview practice workflow:

1. Sign in with Google
2. Upload and analyze a resume
3. Generate interview questions tailored to a role, experience level, and interview mode
4. Submit answers and receive AI-generated scoring and feedback
5. Review interview history and detailed reports
6. Purchase credits when additional interview sessions are needed

Live application: [https://vettorai-1.onrender.com](https://vettorai-1.onrender.com)

---

## What Vettor AI Does

Vettor AI is designed to simulate a realistic interview loop rather than a generic question bank.

The platform supports structured mock interviews that are informed by:

- Candidate role
- Years of experience
- Interview mode
- Resume content
- Skills and projects
- Historical interview performance

The system then evaluates responses across multiple dimensions, including:

- Confidence
- Communication
- Structure
- Depth
- Correctness

That evaluation is persisted so users can review past interviews, compare progress over time, and identify recurring gaps.

---

## Core Features

- AI-generated mock interviews tailored to role and experience
- Resume upload and analysis using PDF parsing
- Structured question generation for interview sessions
- Per-answer scoring with detailed feedback
- Final interview reports with question-wise breakdowns
- Interview history with status, score, and timestamps
- Resume-to-job-description fit score
- Skill roadmap generation
- Offer probability and interview intelligence analysis
- Answer optimization and coaching flows
- Authentication with Firebase Google Sign-In
- JWT-backed protected backend routes
- Credit-based access control for interviews
- Razorpay-powered credit purchases
- Responsive modern UI
- Export-friendly report generation on the client

---

## Product Areas

### Interview Practice

Users can start a guided mock interview based on their target role and experience. The backend generates exactly five interview questions per session and stores the session for later review.

### Resume Intelligence

Uploaded resumes are parsed into text and analyzed to support interview generation and fit scoring. This allows the platform to tailor both the interview flow and the feedback context.

### Performance Feedback

Each answer is scored using multiple evaluation axes. Once the interview is finished, the platform calculates a session-level result and exposes a detailed report with question-level scores.

### Career Guidance

The feature layer also includes:

- Resume and job-description fit scoring
- Skill roadmap recommendations
- Offer probability analysis
- Adaptive interview intelligence
- Answer optimization and coaching

### Credit System

Interviews consume credits. Users can buy additional credits through Razorpay after completing payment verification.

---

## Architecture

The project is organized as a two-part application:

- `client/` - React + Vite frontend
- `server/` - Express API with MongoDB persistence

### Frontend

The client uses:

- React 19
- Vite
- Tailwind CSS
- Framer Motion
- Redux Toolkit
- React Router
- Firebase Auth
- Recharts
- jsPDF and html2canvas for report-oriented UI features

### Backend

The server uses:

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- PDF.js for resume parsing
- Razorpay for payments
- CORS with origin allow-listing

---

## Backend Capabilities

The backend exposes the following functional areas:

### Authentication

- `POST /api/auth/google`
- `GET /api/auth/logout`
- `GET /api/user/current-user`

### Interviews

- `POST /api/interview/analyze-resume`
- `POST /api/interview/generate-questions`
- `POST /api/interview/submit-answer`
- `POST /api/interview/finish`
- `GET /api/interview/get-interview`
- `GET /api/interview/report/:id`

### Features

- `POST /api/feature/fit-score`
- `POST /api/feature/skill-roadmap`

### Payments

- `POST /api/payment/order`
- `POST /api/payment/verify`

### AI Intelligence

- `POST /api/ai/autopilot/follow-up`
- `POST /api/ai/autopilot/coaching`
- `POST /api/ai/autopilot/synthesis`
- `POST /api/ai/offer-intelligence/analyze`
- `POST /api/ai/optimizer/optimize`
- `GET /api/ai/intelligence/profile`

---

## Tech Stack

### Client

- React
- Vite
- Tailwind CSS
- Framer Motion
- Redux Toolkit
- React Router DOM
- Firebase
- Recharts
- jsPDF
- html2canvas

### Server

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Multer
- PDF.js
- Razorpay
- CORS

### Infrastructure

- Render deployment
- HTTP-only cookie session handling
- Environment-based configuration

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- MongoDB database
- Firebase project for Google authentication
- Razorpay account for payments

### Clone the repository

```bash
git clone https://github.com/dev-koushal/VettorAI.git
cd VettorAI
```

### Install dependencies

Install server dependencies:

```bash
cd server
npm install
```

Install client dependencies:

```bash
cd ../client
npm install
```

---

## Environment Variables

### Server

Create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_URLS=http://localhost:5173
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Client

Create `client/.env`:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
VITE_API_BASE_URL=http://localhost:5000
```

> Note: the exact client variables used in the app may vary slightly depending on the Firebase and API configuration in your local setup.

---

## Local Development

Start the backend:

```bash
cd server
npm run dev
```

Start the frontend:

```bash
cd client
npm run dev
```

The client is typically available on Vite's default local port, and the server runs on the port defined in `server/.env`.

---

## Authentication Flow

1. The user signs in with Google through Firebase.
2. The frontend sends the Firebase-authenticated user details to the backend.
3. The backend verifies the user and issues a JWT session.
4. The JWT is stored in an HTTP-only cookie.
5. Protected routes validate the session before allowing access.

This approach keeps authentication state server-validated while avoiding client-side token exposure.

---

## Data and Session Model

The application stores interview sessions in MongoDB and uses the stored records to power:

- Interview history
- Detailed reports
- Average score calculations
- Historical performance context for AI features
- Offer intelligence and optimization flows

The credit system is also persisted server-side so that interview access remains tied to the user account.

---

## Security Considerations

- HTTP-only cookies for session handling
- CORS allow-listing for approved client origins
- JWT-based protected APIs
- Firebase-based authentication entry point
- Payment signature verification before credit allocation
- Server-side ownership checks for interview and optimization actions

---

## Notable User Flows

### 1. Resume-First Interview Preparation

Users upload a resume, extract structured resume context, and use that context to drive targeted interview generation.

### 2. Mock Interview Session

The system generates interview questions, tracks responses, scores each answer, and computes a final session score.

### 3. Review and Improve

Users revisit previous interviews, inspect question-wise performance, and optimize weaker answers using the AI coaching layer.

### 4. Buy More Credits

If the credit balance is insufficient, users can create a Razorpay order, complete payment, and receive added credits after verification.

---

## Future Enhancements

Potential next steps for the product include:

- Voice-based interview practice
- Richer analytics dashboards
- More granular progress tracking
- Company-specific interview playbooks
- Additional export formats for reports
- Expanded adaptive difficulty controls

---

## Project Structure

```text
VettorAI/
|-- client/
|   |-- src/
|   |-- dist/
|   `-- package.json
|-- server/
|   |-- controllers/
|   |-- routes/
|   |-- models/
|   `-- package.json
`-- README.md
```

---

## Author

Kaushal Yadav

Full Stack Developer

---

## License

MIT License
