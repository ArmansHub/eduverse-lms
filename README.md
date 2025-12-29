# Eduverse - Smart Campus Management System

[cite_start]**Eduverse** is a robust, web-based educational platform designed to bridge the gap between school administration, teachers, students, and parents[cite: 20]. [cite_start]Unlike traditional systems, it creates a holistic Learning Management System (LMS) environment to transform institutions into "Smart Campuses"[cite: 21, 23].

## 🚀 Technology Stack
[cite_start]This project uses the **T3 Stack** architecture for type safety and performance[cite: 52].

* [cite_start]**Frontend:** Next.js (React) with Server-Side Rendering (SSR)[cite: 53, 54].
* [cite_start]**Language:** TypeScript for robust type safety[cite: 55, 56].
* [cite_start]**Database:** MongoDB (Relational Model implementation)[cite: 57, 103].
* [cite_start]**ORM:** Prisma for intuitive database interactions[cite: 58, 61].
* [cite_start]**Styling:** Tailwind CSS for responsive UI design[cite: 63, 64].
* [cite_start]**Authentication:** NextAuth.js for secure role-based access control[cite: 65, 66].

## ✨ Key Features

### 1. 🎓 Student & Parent Portal
* [cite_start]**Smart Registration:** Self-service signup where parents can link their profiles to students using a unique Student ID[cite: 70, 74].
* [cite_start]**Personalized Routine:** Students see their specific daily class schedule (Subject, Time, Room) upon logging in[cite: 93].
* [cite_start]**Resource Access:** Download study materials (PDFs, Notes) uploaded by teachers[cite: 84, 94].
* [cite_start]**Academic Tracking:** Parents can view attendance history and exam results in real-time[cite: 100].

### 2. 👨‍🏫 Teacher Dashboard
* [cite_start]**Digital Classroom:** Upload resources, create assignments, and track deadlines[cite: 84, 87].
* [cite_start]**Direct Communication:** Secure chat feature to communicate directly with parents regarding student progress[cite: 89, 99].
* [cite_start]**Grading System:** Mark daily attendance and upload quiz/exam marks[cite: 90].

### 3. 🛡️ Admin Control
* [cite_start]**User Management:** Exclusive rights to create accounts for Teachers to ensure security[cite: 77].
* [cite_start]**Routine Management:** Create master schedules that are automatically pushed to student/teacher dashboards[cite: 78, 80].

## 🛠️ Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/ArmansHub/eduverse-lms.git](https://github.com/ArmansHub/eduverse-lms.git)
    cd eduverse-lms
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root directory and add your MongoDB URI and NextAuth secret.

4.  **Run the application:**
    ```bash
    npm run dev
    ```

## 👥 Contributors

| Name | ID | Contribution |
| :--- | :--- | :--- |
| **Md Arman Hossain** | 2022-2-60-043 | [cite_start]Lead Developer (90%) [cite: 9] |
| **Siam Ahmed** | 2022-2-60-074 | [cite_start]Contributor (10%) [cite: 9] |
---
[cite_start]*Developed for Software Engineering (CSE-412), East West University, Fall-2025[cite: 6, 7].*
