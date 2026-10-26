# School Management Platform

Express + MongoDB (Mongoose) backend, React (Vite) frontend. Roles: admin, teacher, student.

## Setup
### Backend
    cd backend
    npm install
    copy .env.example .env      (then fill in MONGO_URI and a long random JWT_SECRET)
    npm run seed                (creates admin@school.test / Admin123!  -> change it)
    npm run dev                 (http://localhost:5000)

### Frontend
    cd frontend
    npm install
    npm run dev                 (http://localhost:5173)

## Using it
0. Students and teachers can create their own account from the Register link on the login page (admin accounts can only come from `npm run seed`).
1. Log in as admin. Add teachers, then classes (assign a teacher), then students (assign a class).
2. Teachers log in to take attendance, create exams and enter marks for their own classes.
3. Students log in to see their class, attendance, marks and announcements.

Generate a JWT secret:  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
