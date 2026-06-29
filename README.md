# 📖 Dogear

> **Discover books through people, not algorithms.**

Dogear is a modern, social reading journal and community feed designed for book enthusiasts. Instead of cold, algorithmic recommendations, Dogear centers on real human reviews, takeaways, favorite quotes, and interactive reading goals.

---

## ✨ Features

* **💬 Community Activity Feed:** A live social timeline where you can browse book reviews completed by other readers, like posts, and engage in comment threads.
* **👤 Dynamic Reader Timelines:** Beautiful user profile pages displaying reading statistics, streaks, annual reading goals, and a chronological journal of finished books.
* **✏️ Interactive Bios & Follows:** Customize your reader bio directly on your profile, view follower counts, and follow other users to stay connected with their reading journeys.
* **🔍 Pre-Populated Discover Grid:** Browse a pre-cached library of 30 classic books immediately on landing, shelf them to your reading list, or query volumes dynamically via Google Books integration.
* **💭 Famous Quote Carousel:** A sliding hero banner that rotates inspiring quotes from famous thinkers like James Clear, Frank Herbert, Tolkien, and Cal Newport.
* **🎈 Animated GenZ UI:** Fluid hover-lifts on cards, bouncy button clicks, fading scroll slide-ins, and animated book covers drifting in the background.

---

## 🛠️ Technology Stack

### Backend
* **Spring Boot (v3.3.0)** & **Java 24**
* **Spring Security & JWT** for stateless authentication
* **PostgreSQL** for relational data persistence
* **Redis** for OTP verification caching
* **Flyway** for database schema migrations
* **Lombok & MapStruct** for boilerplate reduction

### Frontend
* **Next.js (v14.2.3)** App Router & **React**
* **TailwindCSS** for custom, cozy styling
* **Lucide React** for smooth vector iconography
* **Axios** for API communication

---

## 🚀 Local Development Setup

### Prerequisites
* **Java 24** installed on your system
* **Node.js (v18+)** & **npm**
* **Docker Desktop** installed and running

### 1. Database & Cache Services
Spin up PostgreSQL and Redis using the root docker configuration:
```bash
docker compose up -d
```

### 2. Start the Backend Server
Navigate to the `backend` directory and build/run the Spring Boot application:
```bash
cd backend
./gradlew bootRun
```
*The server will boot on `http://localhost:8080` and automatically seed the database with 15 users, 30 books, and 100+ interactions.*

### 3. Start the Frontend Dev Server
Open a new terminal tab, navigate to the `frontend` directory, install dependencies, and launch the Next.js development server:
```bash
cd frontend
npm install
npm run dev
```
*The client will launch on `http://localhost:3000`.*

---

## 📦 Deployment

This project is set up as a monorepo for straightforward cloud hosting:
* **Database:** Hosted on **Neon** (PostgreSQL) and **Upstash** (Redis).
* **Backend:** Dockerized and hosted on **Render** or **Railway**.
* **Frontend:** Hosted on **Vercel** pointing to the `frontend` subdirectory.

*For step-by-step setup guides, refer to `deployment_guide.md`.*

---

## 📄 License
This project is open-source and available under the MIT License.
