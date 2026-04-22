# Vettor AI

Vettor AI is an AI-powered mock interview platform designed to help developers and students practice technical interviews in a realistic environment.

The platform simulates the interview process by presenting questions, managing interview timing, evaluating responses, and generating performance reports. It allows users to repeatedly practice interviews and track their improvement over time.

Live Website  
https://vettorai-1.onrender.com

---

## What the Website Does

Vettor AI provides a structured environment where users can practice technical interviews similar to real company interview processes.

After signing in, users can start a mock interview session where questions are presented one at a time. Each question has a time limit, encouraging users to think and respond under realistic interview conditions.

Once the interview is completed, the system analyzes the session and generates a report that evaluates the user's performance. The report includes metrics such as confidence, communication clarity, and overall technical performance.

Users can review their past interviews through an interview history section, allowing them to monitor progress and identify areas for improvement.

The platform also includes a credit-based system. Each interview consumes credits, and users can purchase additional credits through integrated online payments.


## Features

• AI-powered technical interview simulation  
• Google authentication using Firebase  
• Real-time interview timer  
• Automated interview scoring  
• Interview history and analytics  
• Credit-based interview system  
• Razorpay payment integration  
• Modern responsive UI

---

## Tech Stack

Frontend  
React  
TailwindCSS  
Framer Motion  

Backend  
Node.js  
Express.js  

Database  
MongoDB  

Authentication  
Firebase Authentication (Google Sign-In)

Payments  
Razorpay

Deployment  
Render

---

## Screenshots

### Landing Page
![Landing Page]
<img width="1891" height="923" alt="Screenshot 2026-04-22 123938" src="https://github.com/user-attachments/assets/dd13a84d-5862-4e9a-b65e-64a58e106d10" />


### Authentication
![Authentication]<img width="867" height="673" alt="image" src="https://github.com/user-attachments/assets/130fe7e3-9b4b-4508-acaa-fbfabc2174c7" />


### Interview Interface
![Interview]
<img width="1913" height="921" alt="Screenshot 2026-04-22 123948" src="https://github.com/user-attachments/assets/c2747cc7-a543-4277-b081-30851dc3f81b" />


### Interview Report
![Report](<img width="1418" height="899" alt="Screenshot 2026-04-22 124035" src="https://github.com/user-attachments/assets/a0627e36-d1e5-46e6-b144-89b22c9bbafd" />


### Pricing / Credits
![Pricing]<img width="1517" height="804" alt="Screenshot 2026-04-22 124007" src="https://github.com/user-attachments/assets/adb38a72-c269-468c-8c57-4e1ffdd884e0" />


---

## Installation

Clone repository
git clone https://github.com/yourusername/vettor-ai.git

cd vettor-ai

Install dependencies


---

## Environment Variables

Create `.env` file in **server**
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
RAZORPAY_KEY_ID=your_key
RAZORPAY_SECRET=your_secret


Create `.env` file in **client**
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com


---

## Authentication Flow

1. User signs in using Google via Firebase  
2. Firebase returns user profile data  
3. Backend checks if the user exists  
4. JWT token is generated  
5. Token stored in HTTP-only cookie  
6. Protected APIs verify JWT before access  

---

## Security

- HTTP-only authentication cookies  
- Secure cookies over HTTPS  
- CORS protection  
- Firebase OAuth authentication  
- JWT-based session management  

---

## Future Improvements

- AI-generated interview questions  
- Code editor integration  
- Voice-based interviews  
- Detailed analytics dashboard  
- Company-specific interview preparation  

---

## Author

Kaushal Yadav  
B.Tech CSE  
Full Stack Developer

---

## License

MIT License
