<p align="center">
  <img src="https://cdn-icons-png.flaticon.com/512/3665/3665224.png" width="100" alt="Chat Logo">
</p>

<h1 align="center">Real-Time Scalable Chat Engine</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=websocket&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
</p>

---

## 🌐 The Project Vision
This isn't just a chat app; it's a **full-stack event-driven system**. It demonstrates the bridge between stateless RESTful services and stateful real-time communication. By utilizing **STOMP over WebSockets**, the application provides a seamless, low-latency experience for global users.

### 

---

## 🛠️ Technical Power Grid

| Tech | Role in the System | Key Engineering Focus |
| :--- | :--- | :--- |
| <img src="https://cdn-icons-png.flaticon.com/512/5968/5968282.png" width="20"> **Spring Boot** | Core Orchestrator | Handled via **STOMP protocols** for structured messaging and sub-millisecond response times. |
| <img src="https://cdn-icons-png.flaticon.com/512/1127/1127237.png" width="20"> **React 18** | UI Layer | Optimized with **Functional Components & Hooks** to ensure zero-lag rendering during high message frequency. |
| <img src="https://cdn-icons-png.flaticon.com/512/2906/2906274.png" width="20"> **MongoDB** | Persistence | Selected for its **schema-less flexibility**, allowing chat histories to scale and store varied metadata (files, reactions). |
| <img src="https://cdn-icons-png.flaticon.com/512/919/919853.png" width="20"> **Docker** | Infrastructure | Containerized for **"Build Once, Run Anywhere"** consistency across dev, staging, and production. |

---

## 📈 Engineering for Scale
A common bottleneck in chat apps is handling millions of concurrent connections. Here is how this architecture is designed to grow:

### 1. The Message Broker (Current vs. Future)
Currently, the system uses an **In-Memory Broker**. To scale for 1M+ users:
* **The Plan:** Integrate **Redis Pub/Sub** or **RabbitMQ**. 
* **The Goal:** This allows us to run multiple backend instances behind a Load Balancer; if User A is on Server 1 and User B is on Server 2, the message broker ensures they can still talk.

### 2. Database Optimization
* **Sharding:** As the chat history grows, MongoDB's sharding capabilities will be utilized to distribute data based on `room_id`, preventing any single database instance from becoming a bottleneck.

### 3. Load Balancing
* **NGINX / AWS ALB:** Implementing "Sticky Sessions" or "Session Affinity" to ensure WebSocket connections stay pinned to the correct server during a session.



---

## 🧠 Solved Challenges

* **The Connection Lifecycle:** Managing "Ghost Connections" (users who disconnect without closing the socket) to save server resources.
* **Message Delivery Guarantees:** Implementing a structured JSON payload that includes timestamps and unique IDs to ensure messages appear in the correct order on all clients.
* **CORS & Security:** Configuring Spring Security to allow cross-origin communication from the React frontend while protecting the WebSocket handshake.

---

## 🚀 Deployment & Operations

### Quick Start (Production-Ready)
```bash
# Bring up the entire stack with one command
docker-compose up -d
```

🛣️ Roadmap: To the Cloud
[ ] Auth: JWT-based stateless authentication.

[ ] Broker: Externalizing the message broker (RabbitMQ/Kafka) for horizontal scaling.

[ ] Cloud: Migrating from Render to AWS ECS (Fargate) for auto-scaling capabilities.

---

## 🤝 Let's Connect

I'm an engineer fascinated by **distributed systems** and **real-time data flow**. I'm always open to discussing system design, backend optimizations, or potential collaborations.

<p align="left">
  <a href="https://www.linkedin.com/in/abhinavkumar03" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="https://backend-engineer-portfolio.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=react&logoColor=white" alt="Portfolio">
  </a>
  <a href="mailto:your-email@example.com">
    <img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email">
  </a>
</p>

---

<p align="center"> 
  <i>"Scalability is not an afterthought; it's a design requirement."</i> 
</p>
