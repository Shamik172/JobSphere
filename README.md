# JobSphere - The All-in-One Technical Interview Platform

JobSphere is a full-stack, real-time web application designed to streamline and enhance the technical interview process. It provides a collaborative environment where interviewers can create assessments, invite candidates, conduct live coding sessions, sketch out ideas on a shared whiteboard, and communicate via video call, all within a single platform.

## Key Features

**Dual User Roles**: Separate, secure portals and dashboards for Interviewers and Candidates.

**Live Collaborative Code Editor**: A real-time, multi-user code editor powered by Monaco Editor (the engine behind VS Code), allowing for a familiar and powerful coding experience.

**Real-time Collaborative Whiteboard**: A shared digital canvas utilizing the Excalidraw API, enabling users to draw diagrams, architect systems, and visualize concepts in real-time.

**Integrated Video Calling**: High-quality, peer-to-peer video communication powered by WebRTC for face-to-face interaction.

**Automated Problem Scraping**: Interviewers can add coding problems simply by pasting an AtCoder URL, with the backend scraping the details using Puppeteer.

**Secure Authentication & File Uploads**: Robust user authentication with JWTs and secure, cloud-based media uploads via Cloudinary.

# Tech Stack

JobSphere is built with the MERN stack and incorporates a variety of modern web technologies for real-time functionality.

| Category | Technology |
| :--- | :--- |
| **Frontend** | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white)![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) **Monaco Editor, Excalidraw API** |
| **Backend** | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=node.js&logoColor=white) ![Express.js](https://img.shields.io/badge/-Express.js-000000?logo=express&logoColor=white) |
| **Database** | ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white) ![Mongoose](https://img.shields.io/badge/-Mongoose-880000?logo=mongoose&logoColor=white) |
| **Real-time** | ![Socket.IO](https://img.shields.io/badge/-Socket.IO-010101?logo=socket.io&logoColor=white) ![WebRTC](https://img.shields.io/badge/-WebRTC-333333?logo=webrtc&logoColor=white) |
| **Other's** | ![JWT](https://img.shields.io/badge/-JWT-000000?logo=json-web-tokens&logoColor=white) ![Cloudinary](https://img.shields.io/badge/-Cloudinary-3448C5?logo=cloudinary&logoColor=white) ![Puppeteer](https://img.shields.io/badge/-Puppeteer-40B5A4?logo=puppeteer&logoColor=white) ![Render](https://img.shields.io/badge/-Render-46E3B7?logo=render&logoColor=white) |



🏛️ Architecture & How It Works


### WorkFlow Diagram 
```mermaid
graph TD
    %% --- Define Node Styles ---
    classDef default fill:#fff,stroke:#333,stroke-width:2px,color:#333
    classDef user fill:#e6f7ff,stroke:#0056b3
    classDef fe fill:#e0f7fa,stroke:#00796b
    classDef be fill:#fff8e1,stroke:#f57f17
    classDef db fill:#f3e5f5,stroke:#6a1b9a
    classDef service fill:#f1f8e9,stroke:#558b2f
    
    %% --- Define Subgraphs ---
    subgraph " "
        I(fa:fa-user-tie Interviewer)
        C(fa:fa-user-graduate Candidate)
        class I,C user
    end

    subgraph "Frontend (React SPA on Vercel)"
        direction TB
        App[fa:fa-react React Application]
        Code(fa:fa-code Monaco Editor)
        Whiteboard(fa:fa-palette Excalidraw)
        Video[fa:fa-video WebRTC Video Peers]
        App --> Code
        App --> Whiteboard
        App --> Video
        class App,Code,Whiteboard,Video fe
    end

    subgraph "Backend (Node.js Server on Render)"
        direction TB
        API[fa:fa-server REST API / Auth]
        Socket[fa:fa-plug Socket.IO Server]
        Scraper[fa:fa-robot Puppeteer Service]
        class API,Socket,Scraper be
    end
    
    subgraph "Database"
        DB[(fa:fa-database MongoDB Atlas)]
        class DB db
    end

    subgraph "External Services"
        direction TB
        STUN(fa:fa-network-wired STUN Server)
        TURN(fa:fa-exchange-alt TURN Server)
        Cloud(fa:fa-cloud-upload-alt Cloudinary)
        AtCoder(fa:fa-sitemap AtCoder.jp)
        class STUN,TURN,Cloud,AtCoder service
    end

    %% --- Define Flows ---
    
    %% User Flow
    I & C -- "Interact" --> App

    %% HTTP API Flows
    App -- "HTTP API Calls (Login, Save)" --> API
    API -- "DB Operations" --> DB
    API -- "File Upload" --> Cloud
    API -- "Start Scrape" --> Scraper
    Scraper -- "Fetch HTML" --> AtCoder
    Scraper -- "Save Problem" --> API

    %% Real-time Socket.IO Flows
    Code -- "code-change" --> Socket
    Whiteboard -- "whiteboard-change" --> Socket
    Socket -- "broadcast" --> Code
    Socket -- "broadcast" --> Whiteboard

    %% WebRTC Flow (More Descriptive)
    Video -- "1. Signaling (Offer/Answer)" --> Socket
    Socket -- "2. Relay Signals" --> Video
    Video -- "3. Get Public IP (Handshake)" --> STUN
    Video <-. "4a. Direct P2P Stream (Success)" .-> Video
    Video -- "4b. Relayed Stream (Fallback)" --> TURN
    TURN -- "4b. Relayed Stream (Fallback)" --> Video
```

## Modulewise Working
### **1. Backend (Node.js / Express)**

The backend manages the RESTful API, database operations, and user authentication using JWTs in httpOnly cookies.

### **2. Real-Time Communication Layer**

This is the core of the collaborative experience, managed via Socket.IO rooms.

**a) Collaborative Editor**: Utilizes the Monaco Editor component on the frontend. User keystrokes emit code-change events via Socket.IO, which are broadcast to other users in the same room to synchronize the editor state.

**b) Collaborative Whiteboard:** Integrates the Excalidraw API on the frontend. As a user draws, the Excalidraw component emits scene data changes. These changes are sent over Socket.IO via a whiteboard-change event and broadcast to other room members, keeping the canvas in sync for all participants.

**c) Video Call (WebRTC):** Employs Socket.IO as a signaling server to orchestrate the peer-to-peer WebRTC connection handshake (offer/answer/ICE candidates) between clients.

### **3. Server-Side Automation (Puppeteer)**

The backend uses Puppeteer to run a headless Chromium instance, automating the scraping of problem data from AtCoder URLs to populate assessments , then using gemini api  to generate testcases for the problem.

## **⚙️ Environment Variables**

To run this project, you will need a .env file in the backend directory with your MONGO_URI, JWT_SECRET, GEMINI_API_KEY  and Cloudinary , SMTP.


## Getting Started Locally

1) Clone the repository.

2) Run  ``` npm install``` in both the frontend and backend directories.

3) Create and configure your ```.env``` file in the backend.

4) Run ```nodemon index.js (backend)``` and ```npm run dev (frontend)```.
