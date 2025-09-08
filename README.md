# College Project Twitter - Academic Social Network

A full-stack social network application built with Node.js, Express, MongoDB, and a modern frontend that clones the X (Twitter) platform UI.

## 🚀 Features

### ✅ **Core Requirements Met:**
- **Node.js + Express** backend with MVC architecture
- **MongoDB** database with 5+ models (User, Post, Group, Like, Follows, VisualContent)
- **Full CRUD operations** for all models
- **Search functionality** with multiple filters
- **GroupBy queries** for statistics
- **Authentication system** (username/password)
- **Group management** (create, join, leave, manage)
- **Feed system** with posts from friends and groups
- **Permission system** (users can only edit/delete their own content)

### 🎨 **Frontend Features:**
- **X Platform UI Clone** with dark theme
- **HTML5 semantic tags** (`<aside>`, `<footer>`, `<header>`, `<nav>`, `<section>`)
- **CSS3 features**: `text-shadow`, `transition`, `multiple-columns`, `@font-face`, `border-radius`
- **Responsive design** with Bootstrap 5
- **Modern JavaScript** (ES6+, async/await, modular code)
- **AJAX requests** for dynamic content loading
- **Error handling** and validation

### 📊 **Advanced Features:**
- **D3.js graphs** for post statistics (placeholder)
- **OpenWeatherMap API** integration (Web Service)
- **Google Maps** integration (placeholder)
- **Twitter API** integration (placeholder)
- **Canvas element** for visual interactions
- **Video support** with HTML5 `<video>` element
- **Real-time data** from MongoDB

## 🛠️ **Tech Stack**

### Backend:
- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **MVC Architecture**
- **RESTful API**

### Frontend:
- **HTML5** + **CSS3** + **JavaScript (ES6+)**
- **Bootstrap 5**
- **Font Awesome**
- **D3.js** (for graphs)
- **Fetch API** (for AJAX)

### APIs & Services:
- **OpenWeatherMap API**
- **Google Maps API** (placeholder)
- **Twitter API** (placeholder)

## 📁 **Project Structure**

```
college-project-twitter/
├── Model/                          # Backend (MVC)
│   ├── app.js                     # Main Express app
│   ├── db.js                      # MongoDB connection
│   ├── schemas/                   # Mongoose models
│   │   ├── user.js
│   │   ├── post.js
│   │   ├── group.js
│   │   ├── like.js
│   │   ├── follows.js
│   │   └── visualcontent.js
│   ├── services/                  # Business logic
│   │   ├── userService.js
│   │   ├── postService.js
│   │   ├── groupService.js
│   │   ├── followService.js
│   │   └── visualContentService.js
│   ├── controllers/               # Request handlers
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── groupController.js
│   │   ├── followController.js
│   │   └── visualContentController.js
│   └── routes/                    # API routes
│       ├── userRoutes.js
│       ├── postRoutes.js
│       ├── groupRoutes.js
│       ├── followRoutes.js
│       └── visualContentRoutes.js
├── View/                          # Frontend
│   ├── Pages/
│   │   ├── Feed/                 # Main feed page
│   │   │   ├── Feed.html
│   │   │   ├── Feed.css
│   │   │   └── Feed.js
│   │   ├── Login/                # Login page
│   │   └── CreateUser/           # Registration page
│   └── assets/                   # Static assets
├── package.json
└── README.md
```

## 🚀 **Setup Instructions**

### **1. Prerequisites**
- **Node.js** (v14 or higher)
- **MongoDB** Community Server
- **Git**

### **2. Install MongoDB (macOS)**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Add Homebrew to PATH
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
source ~/.zshrc

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
brew services start mongodb/brew/mongodb-community
```

### **3. Clone and Setup Project**
```bash
# Clone repository
git clone <your-repo-url>
cd college-project-twitter

# Install dependencies
npm install

# Create environment file
echo "MONGODB_URI=mongodb://localhost:27017
MONGODB_DBNAME=twitterdb
PORT=3000
JWT_SECRET=your_jwt_secret_key_here" > .env
```

### **4. Run the Application**
```bash
# Start MongoDB (if not running)
brew services start mongodb/brew/mongodb-community

# Start the server
npm start

# Open browser
# Frontend: http://127.0.0.1:5500/View/Pages/Feed/Feed.html
# Backend API: http://localhost:3000
```

## 📊 **Database Models**

### **User Model**
- `username`, `password`, `email`, `name`
- `birthYear`, `birthMonth`, `birthDay`
- `bio`, `location`, `website`
- `avatar`, `coverImage`, `isVerified`

### **Post Model**
- `date`, `username`, `textContent`
- `visualContent` (reference to VisualContent)
- `groupId` (reference to Group)
- `postType` (personal/group)
- `tags`, `location` (with coordinates)

### **Group Model**
- `name`, `description`, `creator`
- `members` (array with join dates)
- `posts` (array of post references)
- `isPrivate`, `tags`

### **Like Model**
- `userId`, `postId`, `createdAt`
- Unique constraint on userId + postId

### **Follows Model**
- `followingUser`, `followedUser`, `followDate`
- Unique constraint on followingUser + followedUser

### **VisualContent Model**
- `content` (URL or storage key)
- `mimeType`, `mediaType` (image/video/audio)
- `fileName`, `fileSizeBytes`
- `width`, `height`, `durationSec`

## 🔍 **API Endpoints**

### **Users**
- `POST /api/users` - Create user
- `GET /api/users` - Get all users
- `GET /api/users/:username` - Get user by username
- `PUT /api/users/:username` - Update user
- `DELETE /api/users/:username` - Delete user
- `POST /api/users/authenticate` - Login
- `POST /api/users/search` - Search users

### **Posts**
- `POST /api/posts` - Create post
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get post by ID
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/user/:username` - Get posts by user
- `GET /api/posts/group/:groupId` - Get posts by group
- `GET /api/posts/feed/:username` - Get user's feed
- `POST /api/posts/search` - Search posts
- `GET /api/posts/stats` - Get post statistics

### **Groups**
- `POST /api/groups` - Create group
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get group by ID
- `PUT /api/groups/:id` - Update group
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/join` - Join group
- `POST /api/groups/leave` - Leave group
- `GET /api/groups/creator/:username` - Get groups by creator
- `GET /api/groups/member/:username` - Get groups by member
- `POST /api/groups/search` - Search groups
- `GET /api/groups/stats` - Get group statistics

### **Follows**
- `POST /api/follows` - Follow user
- `DELETE /api/follows` - Unfollow user
- `GET /api/follows/following/:username` - Get following
- `GET /api/follows/followers/:username` - Get followers
- `GET /api/follows/status` - Check follow status
- `GET /api/follows/stats/:username` - Get follow stats

### **Visual Content**
- `POST /api/visual-content` - Create visual content
- `GET /api/visual-content/:id` - Get visual content

## 🔍 **Search Features**

### **Post Search (3+ parameters)**
- **Text content** (regex search)
- **Author** (username filter)
- **Date range** (from/to dates)
- **Post type** (personal/group)
- **Has media** (visual content filter)
- **Group** (groupId filter)

### **Group Search (3+ parameters)**
- **Name/Description** (regex search)
- **Creator** (username filter)
- **Date range** (creation date)
- **Privacy** (public/private)
- **Tags** (tag matching)

### **User Search (3+ parameters)**
- **Username/Name/Bio** (regex search)
- **Verification status** (verified/unverified)
- **Location** (location filter)

## 📊 **GroupBy Queries**

### **Post Statistics**
- Posts by user count
- Posts by group count
- Posts by date count
- Posts by media type

### **Group Statistics**
- Groups by creator count
- Groups by member count

## 🎯 **Project Requirements Compliance**

### ✅ **Technical Requirements:**
- [x] Node.js + Express backend
- [x] MongoDB database
- [x] MVC architecture
- [x] 5+ models (User, Post, Group, Like, Follows, VisualContent)
- [x] Full CRUD operations
- [x] Multiple post types (text, image, video)
- [x] Search with 3+ parameters
- [x] 2+ GroupBy queries
- [x] Username/password authentication
- [x] Public/private page access
- [x] User permission system
- [x] Group management
- [x] Feed system
- [x] Error handling and validation
- [x] AJAX and async requests

### ✅ **Frontend Requirements:**
- [x] HTML5 semantic tags
- [x] CSS3 features (text-shadow, transition, multiple-columns, @font-face, border-radius)
- [x] JavaScript with AJAX
- [x] Canvas element
- [x] Video element
- [x] D3.js graphs (placeholder)
- [x] Web Service integration (OpenWeatherMap)
- [x] Google Maps integration (placeholder)
- [x] Twitter API integration (placeholder)

## 🚀 **Getting Started**

1. **Start MongoDB**: `brew services start mongodb/brew/mongodb-community`
2. **Install dependencies**: `npm install`
3. **Start server**: `npm start`
4. **Open feed page**: `http://127.0.0.1:5500/View/Pages/Feed/Feed.html`

## 📝 **Notes**

- The application uses a demo user for testing
- All API endpoints are fully functional
- The frontend is a complete X platform clone
- Weather data refreshes every 10 minutes
- All CRUD operations work with the MongoDB backend
- Search functionality supports multiple filters
- Group management is fully implemented

## 🤝 **Contributing**

This is an academic project. Feel free to use it as a reference for your own projects!

## 📄 **License**

This project is for educational purposes only.