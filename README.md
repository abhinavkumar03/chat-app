# Real-Time Group Chat Application 🚀

A scalable, real-time group chat application built with Spring Boot, WebSockets, MongoDB, and React. The application enables users to create and join chat rooms, exchange messages in real-time, and persist conversation history.

![Tech Stack](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-000000?style=for-the-badge&logo=websocket&logoColor=white)

## 🌟 Features

- 🏠 Create and join multiple chat rooms
- 💬 Real-time message exchange using WebSockets
- 📝 Message persistence in MongoDB
- 🔄 Live updates without page refresh
- 🐳 Dockerized deployment
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design

## 🛠️ Tech Stack

### Backend
- Spring Boot 3.x
- Spring WebSocket (STOMP)
- MongoDB
- Spring Security (planned)
- JWT Authentication (planned)

### Frontend
- React 18
- Tailwind CSS
- SockJS Client
- STOMP.js
- React Router

### Infrastructure
- Docker
- MongoDB Atlas
- Render (Current)
- AWS (Planned Migration)

## 🚀 Quick Start with Docker

The easiest way to run the application is using Docker:

```bash
# Pull the Docker images
docker pull abhinavkumar03/chat-backend:latest
docker pull abhinavkumar03/chat-frontend:latest

# Run the backend container
docker run -d \
  --name chat-backend \
  -p 8080:8080 \
  -e SPRING_DATA_MONGODB_URI=your_mongodb_uri \
  abhinavkumar03/chat-backend:latest

# Run the frontend container
docker run -d \
  --name chat-frontend \
  -p 3000:80 \
  -e REACT_APP_API_URL=http://localhost:8080 \
  abhinavkumar03/chat-frontend:latest
```

## 🛠️ Manual Setup

### Backend Setup

1. **Prerequisites**
   - Java 17 or higher
   - Maven
   - MongoDB

2. **Clone and Build**
   ```bash
   cd chatapp-backend
   mvn clean install
   ```

3. **Configuration**
   Create `application.properties`:
   ```properties
   server.port=8080
   spring.data.mongodb.uri=your_mongodb_uri
   spring.websocket.allowed-origins=http://localhost:3000
   ```

4. **Run the Application**
   ```bash
   mvn spring-boot:run
   ```

### Frontend Setup

1. **Prerequisites**
   - Node.js 16 or higher
   - npm or yarn

2. **Clone and Install Dependencies**
   ```bash
   cd chatapp-frontend
   npm install
   ```

3. **Environment Setup**
   Create `.env`:
   ```env
   REACT_APP_API_URL=http://localhost:8080
   ```

4. **Run the Development Server**
   ```bash
   npm start
   ```

## 📦 Project Structure

```
chatapp/
├── chatapp-backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   ├── config/
│   │   │   │   ├── controller/
│   │   │   │   ├── model/
│   │   │   │   ├── repository/
│   │   │   │   ├── service/
│   │   │   │   └── websocket/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
│
└── chatapp-frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── utils/
    │   └── App.js
    ├── public/
    └── package.json
```

## 🔮 Future Development Plans

### Authentication & Security
- [ ] JWT-based authentication
- [ ] OAuth2 integration
- [ ] Role-based access control
- [ ] End-to-end encryption for messages

### Features
- [ ] Private messaging
- [ ] Message status (delivered/read)
- [ ] File sharing
- [ ] User presence indicators
- [ ] Message reactions
- [ ] Message search
- [ ] User profiles and avatars

### Scalability & Performance
- [ ] Kafka integration for message queuing
- [ ] Redis for caching
- [ ] Horizontal scaling with Kubernetes
- [ ] Load balancing
- [ ] CDN integration for static assets

### DevOps & Infrastructure
- [ ] CI/CD pipeline with GitHub Actions
- [ ] AWS migration (EC2, S3, ECS)
- [ ] Infrastructure as Code (Terraform)
- [ ] Automated testing
- [ ] Monitoring and logging (ELK Stack)
- [ ] Performance metrics (Prometheus/Grafana)

### Mobile & PWA
- [ ] Progressive Web App support
- [ ] Mobile-first responsive design
- [ ] Push notifications
- [ ] Offline support

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Author

Abhinav Kumar
- GitHub: [@abhinavkumar03](https://github.com/abhinavkumar03)
- LinkedIn: [Your LinkedIn Profile]

## 🙏 Acknowledgments

- Spring Boot team for the amazing framework
- MongoDB team for the database
- React team for the frontend library
- All contributors and supporters of the project 