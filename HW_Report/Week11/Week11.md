# 🚀 Week 7 Report - Group 1

## 📚 Table of Contents

- [📋 Work Items](#-work-items)
- [🎬 Demo Video](#-demo-video)
- [🎯 Topics Practiced](#-topics-practiced)
- [🛠️ Additional Techniques Explored](#️-additional-techniques-explored)
- [🔌 API Specification](#-api-specification)
- [👨‍💻 Team Member Contributions](#-team-member-contributions)

---

## 📋 Work Items

### 🖥️ Frontend

- Developed `Calendar.jsx` component for scheduling (accessible via `/test`)
- Implemented a chat widget for messaging with friends
- Enhanced landmark listing with user geolocation support
- Created a user profile page and integrated it with backend APIs

### 🔧 Backend

- Implemented RESTful APIs for user, venue, court, reservation, chat, and friends
- Supported real-time private and group messaging via WebSocket
- Implemented full CRUD operations and reservation conflict management

---

## 🎬 Demo Video

📹 [Click to view the demo](https://drive.google.com/file/d/1JcnWkiGzBLWm-7mYZ5KuSI1bHGbr6H4v/view)

---

## 🎯 Topics Practiced

- Integrated **AJAX** and **WebSocket** to build a real-time chat application using React

---

## 🛠️ Additional Techniques Explored

- 📅 Integrated **DayPilot** to implement a fully customized and interactive scheduling calendar tailored to our reservation system.

---

## 🔌 API Specification

### Base URL

```
https://localhost:3000 # Swagger UI Page
```

> All protected endpoints require the following header:
```
Authorization: Bearer <access_token>
```

### 1. Authentication

| Method | Path                  | Description               |
|--------|-----------------------|---------------------------|
| POST   | `/auth/register`      | Register a new user       |
| POST   | `/auth/login`         | Authenticate user         |
| POST   | `/auth/refresh-token` | Refresh access token      |

### 2. User

| Method | Path            | Description                   |
|--------|------------------|-------------------------------|
| GET    | `/user/profile` | Retrieve current user profile |
| PATCH  | `/user/profile` | Update user profile           |
| POST   | `/user/photo`   | Upload or update profile photo|

### 3. Venue

| Method | Path           | Description                        |
|--------|----------------|------------------------------------|
| GET    | `/venues`      | List all available venues          |
| GET    | `/venues/{id}` | Retrieve venue details by ID       |

### 4. Court

| Method | Path                                  | Description                                 |
|--------|---------------------------------------|---------------------------------------------|
| GET    | `/courts/{court_id}`                  | Retrieve court details                      |
| GET    | `/courts/court-venue-name/{court_id}` | Retrieve court with associated venue details|

### 5. Reservation

| Method | Path                        | Description                            |
|--------|-----------------------------|----------------------------------------|
| POST   | `/reserve`                  | Create a new court reservation         |
| GET    | `/reserve/court/{court_id}` | List all reservations for a specific court |

### 6. Chat

| Method | Path                               | Description                         |
|--------|------------------------------------|-------------------------------------|
| GET    | `/chats`                           | Retrieve all chats                  |
| POST   | `/chats/{chatId}/read`             | Mark a chat as read                 |
| GET    | `/chats/private/{friendId}`        | Retrieve private chat with a friend |
| POST   | `/chats/private/{friendId}`        | Send message in private chat        |
| POST   | `/chats/group`                     | Create a new group chat             |
| POST   | `/chats/{chatId}/members/{userId}` | Add a user to group chat            |
| POST   | `/chats/{chatId}/remove/{userId}`  | Remove a user from group chat       |
| GET    | `/chats/{chatId}/messages`         | List messages in a specific chat    |
| POST   | `/chats/{chatId}/messages`         | Send a message in any chat          |

### 7. Friends

| Method | Path                                   | Description                                 |
|--------|----------------------------------------|---------------------------------------------|
| GET    | `/friends/{userId}`                    | Get a user's friend list                    |
| GET    | `/friends/{userId}/requests`           | Get incoming friend requests                |
| POST   | `/friends/{userId}/request`            | Send a friend request to another user       |
| PUT    | `/friends/{userId}/respond/{senderId}` | Accept or decline a received friend request |

---

## 👨‍💻 Team Member Contributions

| Name  | Role              | Contribution |
|-------|-------------------|:------------:|
| 黃靖家 | Full Stack DevOps |     1/4      |
| 楊盛評 | Full Stack DevOps |     1/4      |
| 羅煜翔 | Full Stack DevOps |     1/4      |
| 郭恩偕 | Full Stack DevOps |     1/4      |
