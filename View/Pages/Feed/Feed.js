// X (Twitter) Platform Clone - JavaScript with MongoDB Integration

class APIService {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
    }

    // User API methods
    async createUser(userData) {
        const response = await fetch(`${this.baseURL}/users/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });
        return response.json();
    }

    async getExistingUsers(){
        const response = await fetch(`${this.baseURL}/users/all`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.json();
    }

    async authenticateUser(username, password) {
        const response = await fetch(`${this.baseURL}/users/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                credentials: 'include'
            },
            body: JSON.stringify({ username, password })
        });
        return response.json();
    }

    async getUser(username) {
        const response = await fetch(`${this.baseURL}/users/${username}`);
        return response.json();
    }

    // Post API methods
    async createPost(postData) {
        const response = await fetch(`${this.baseURL}/posts`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postData)
        });
        return response.json();
    }

    async getFeedPosts() {
        const response = await fetch(`${this.baseURL}/posts`, {
            method: 'GET',
            credentials: 'include'});
        return response.json();
    }

    // Follow API methods
    async followUser(followedUser) {
        const response = await fetch(`${this.baseURL}/follows`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ followedUser })
        });
        return response.json();
    }

    async unfollowUser(followingUser, followedUser) {
        const response = await fetch(`${this.baseURL}/follows`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ followingUser, followedUser })
        });
        return response.json();
    }

    async getFollowedUsers(username) {
        const response = await fetch(`${this.baseURL}/follows/${username}`);
        return response.json();
    }

    async getOwnUser(){
        const response = await fetch(`${this.baseURL}/users/me`, {
            method: 'GET',
            credentials: 'include'
        });
        return response.json();
    }
}

class XFeedManager {
    constructor() {
        this.apiService = new APIService();
        this.currentUser = null;
        this.posts = [];
        this.followedUsers = [];
        this.likes = new Map(); // Store user likes
        this.currentPage = 1;
        this.isLoading = false;
        this.characterLimit = 280;
        this.currentSection = 'home';
        this.currentCategory = 'for-you';
        
        let watchId = navigator.geolocation.watchPosition(
        (position) => {
            console.log("Updated Latitude:", position.coords.latitude);
            console.log("Updated Longitude:", position.coords.longitude);
        }
        );

        // Weather Widget Configuration
        this.weatherConfig = {
            apiKey: 'e5c0b5f0ed680b3c0c57f799ba8e7fc5', // TODO: Replace with actual API key
            city: 'London', // TODO: Replace with desired city name
            refreshInterval: 10 * 60 * 1000, // 10 minutes in milliseconds
            units: 'metric' // metric, imperial, or kelvin
        };
        this.weatherRefreshTimer = null;
        
        this.init();
    }

    async init() {
        try {
            await this.loadCurrentUser();
            this.setupEventListeners();
            this.loadPosts();
            this.updateCharacterCount();
            this.initWeatherWidget();
            this.getOwnUser();
            this.getExistingUsersToFollow();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize the feed');
        }
    }

    // Load current user data
    async loadCurrentUser() {
        try {
            // Check if user is logged in (from localStorage or session)
            const savedUser = localStorage.getItem('currentUser');
            if (savedUser) {
                this.currentUser = JSON.parse(savedUser);
                console.log('Loaded user from storage:', this.currentUser);
            } else {
                // For demo purposes, create a default user or redirect to login
                this.currentUser = {
                    _id: 'demo-user-id',
                    username: 'demo_user',
                    name: 'Demo User',
                    email: 'demo@example.com',
                    avatar: 'https://via.placeholder.com/48/1DA1F2/ffffff?text=DU'
                };
                console.log('Using demo user:', this.currentUser);
            }
        } catch (error) {
            console.error('Error loading user:', error);
            throw error;
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Post composer
        const postContent = document.getElementById('post-content');
        const postSubmitBtn = document.getElementById('post-submit-btn');
        const mediaBtn = document.getElementById('media-btn');
        const mediaInput = document.getElementById('media-input');

        postContent.addEventListener('input', () => {
            this.updateCharacterCount();
            this.updatePostButton();
        });

        postContent.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleCreatePost();
            }
        });

        postSubmitBtn.addEventListener('click', () => this.handleCreatePost());
        mediaBtn.addEventListener('click', () => mediaInput.click());
        mediaInput.addEventListener('change', (e) => this.handleMediaPreview(e));

        // Search functionality
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));

        // Explore search functionality
        const exploreSearchInput = document.getElementById('explore-search-input');
        exploreSearchInput.addEventListener('input', (e) => this.handleExploreSearch(e.target.value));

        // Navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                if (section) {
                    this.switchSection(section);
                }
            });
        });

        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });

        // Explore category tabs
        const exploreTabBtns = document.querySelectorAll('.explore-tab-btn');
        exploreTabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchExploreCategory(btn));
        });

        // // Follow buttons
        // document.addEventListener('click', (e) => {
        //     if (e.target.classList.contains('follow-btn')) {
        //         this.handleFollow(e.target);
        //     }
        // });

        // Weather widget event listeners
        const weatherRefreshBtn = document.getElementById('weather-refresh-btn');
        const weatherRetryBtn = document.getElementById('weather-retry-btn');
        
        if (weatherRefreshBtn) {
            weatherRefreshBtn.addEventListener('click', () => this.refreshWeather());
        }
        
        if (weatherRetryBtn) {
            weatherRetryBtn.addEventListener('click', () => this.refreshWeather());
        }
    }

    // Initialize Weather Widget
    initWeatherWidget() {
        // Check if weather widget exists
        if (!document.getElementById('weather-widget')) {
            console.warn('Weather widget not found in DOM');
            return;
        }

        // Start weather refresh cycle
        this.startWeatherRefreshCycle();
        
        // Load initial weather data
        this.loadWeatherData();
    }

    // Start automatic weather refresh cycle
    startWeatherRefreshCycle() {
        // Clear existing timer if any
        if (this.weatherRefreshTimer) {
            clearInterval(this.weatherRefreshTimer);
        }

        // Set new timer for automatic refresh
        this.weatherRefreshTimer = setInterval(() => {
            this.loadWeatherData();
        }, this.weatherConfig.refreshInterval);

        console.log(`Weather widget will refresh every ${this.weatherConfig.refreshInterval / 60000} minutes`);
    }

    // Load weather data from OpenWeatherMap API
    async loadWeatherData() {
        try {
            // Show loading state
            this.showWeatherLoading();

            // Check if API key is configured
            if (this.weatherConfig.apiKey === 'YOUR_OPENWEATHERMAP_API_KEY') {
                throw new Error('OpenWeatherMap API key not configured. Please add your API key in the weatherConfig object.');
            }

            // Build API URL
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(this.weatherConfig.city)}&appid=${this.weatherConfig.apiKey}&units=${this.weatherConfig.units}`;

            // Fetch weather data
            const response = await fetch(apiUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const weatherData = await response.json();
            
            // Check for API error response
            if (weatherData.cod && weatherData.cod !== 200) {
                throw new Error(weatherData.message || 'Unknown API error');
            }

            // Update weather widget with data
            this.updateWeatherWidget(weatherData);
            
            // Update last updated time
            this.updateWeatherTimestamp();

        } catch (error) {
            console.error('Error loading weather data:', error);
            this.showWeatherError(error.message);
        }
    }

    // Update weather widget with API data
    updateWeatherWidget(weatherData) {
        try {
            // Extract weather information
            const cityName = weatherData.name;
            const country = weatherData.sys?.country;
            const temperature = Math.round(weatherData.main?.temp);
            const feelsLike = Math.round(weatherData.main?.feels_like);
            const humidity = weatherData.main?.humidity;
            const windSpeed = Math.round(weatherData.wind?.speed * 3.6); // Convert m/s to km/h
            const description = weatherData.weather?.[0]?.description;
            const iconCode = weatherData.weather?.[0]?.icon;

            // Update DOM elements
            const cityElement = document.getElementById('weather-city');
            const tempElement = document.getElementById('weather-temperature');
            const feelsLikeElement = document.getElementById('weather-feels-like');
            const humidityElement = document.getElementById('weather-humidity');
            const windElement = document.getElementById('weather-wind');
            const descriptionElement = document.getElementById('weather-description');
            const iconElement = document.getElementById('weather-icon');

            if (cityElement) cityElement.textContent = `${cityName}${country ? `, ${country}` : ''}`;
            if (tempElement) tempElement.textContent = temperature || '--';
            if (feelsLikeElement) feelsLikeElement.textContent = feelsLike || '--';
            if (humidityElement) humidityElement.textContent = humidity || '--';
            if (windElement) windElement.textContent = windSpeed || '--';
            if (descriptionElement) descriptionElement.textContent = description || 'Weather description';

            // Update weather icon
            if (iconElement && iconCode) {
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                iconElement.src = iconUrl;
                iconElement.alt = description || 'Weather icon';
            }

            // Show weather content
            this.showWeatherContent();

        } catch (error) {
            console.error('Error updating weather widget:', error);
            this.showWeatherError('Failed to update weather display');
        }
    }

    // Update weather timestamp
    updateWeatherTimestamp() {
        const timestampElement = document.getElementById('weather-updated-time');
        if (timestampElement) {
            const now = new Date();
            timestampElement.textContent = now.toLocaleTimeString();
        }
    }

    // Show weather loading state
    showWeatherLoading() {
        const loadingElement = document.getElementById('weather-loading');
        const contentElement = document.getElementById('weather-content');
        const errorElement = document.getElementById('weather-error');

        if (loadingElement) loadingElement.style.display = 'block';
        if (contentElement) contentElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'none';
    }

    // Show weather content
    showWeatherContent() {
        const loadingElement = document.getElementById('weather-loading');
        const contentElement = document.getElementById('weather-content');
        const errorElement = document.getElementById('weather-error');

        if (loadingElement) loadingElement.style.display = 'none';
        if (contentElement) contentElement.style.display = 'block';
        if (errorElement) errorElement.style.display = 'none';
    }

    // Show weather error state
    showWeatherError(message) {
        const loadingElement = document.getElementById('weather-loading');
        const contentElement = document.getElementById('weather-content');
        const errorElement = document.getElementById('weather-error');
        const errorMessageElement = document.getElementById('weather-error-message');

        if (loadingElement) loadingElement.style.display = 'none';
        if (contentElement) contentElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'block';
        if (errorMessageElement) errorMessageElement.textContent = message;
    }

    // Refresh weather data manually
    refreshWeather() {
        console.log('Manual weather refresh requested');
        this.loadWeatherData();
    }

    // Switch between main sections (Home/Explore)
    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content sections
        document.querySelectorAll('.content-section').forEach(sectionEl => {
            sectionEl.classList.remove('active');
        });
        document.getElementById(`${section}-section`).classList.add('active');

        this.currentSection = section;

        // Update header title
        const headerTitle = document.querySelector('.x-header h1');
        if (headerTitle) {
            headerTitle.textContent = section === 'home' ? 'Home' : 'Explore';
        }

        // Show success message
        this.showSuccess(`Switched to ${section} section`);
    }

    // Switch explore categories
    switchExploreCategory(clickedTab) {
        document.querySelectorAll('.explore-tab-btn').forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');

        const category = clickedTab.dataset.category;
        this.currentCategory = category;

        // Update content
        document.querySelectorAll('.explore-category-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${category}-content`).classList.add('active');

        this.showSuccess(`Switched to ${category.replace('-', ' ')} category`);
    }

    // Handle explore search
    handleExploreSearch(query) {
        if (!query.trim()) {
            // Reset to current category content
            this.switchExploreCategory(document.querySelector('.explore-tab-btn.active'));
            return;
        }

        // Filter content based on search query
        const searchResults = this.getExploreSearchResults(query);
        this.displayExploreSearchResults(searchResults);
    }

    // Get explore search results
    getExploreSearchResults(query) {
        const results = [];
        const searchTerm = query.toLowerCase();

        // Search in news items
        const newsItems = document.querySelectorAll('.news-item, .trending-post, .news-post, .sports-post, .entertainment-post');
        newsItems.forEach(item => {
            const title = item.querySelector('.news-title, .trending-post-content, .news-post-title, .sports-post-title, .entertainment-post-title');
            const category = item.querySelector('.news-category, .trending-post-author, .news-post-source, .sports-post-league, .entertainment-post-source');
            
            if (title && (title.textContent.toLowerCase().includes(searchTerm) || 
                (category && category.textContent.toLowerCase().includes(searchTerm)))) {
                results.push(item.cloneNode(true));
            }
        });

        return results;
    }

    // Display explore search results
    displayExploreSearchResults(results) {
        const exploreContent = document.querySelector('.explore-content');
        
        // Hide all category content
        document.querySelectorAll('.explore-category-content').forEach(content => {
            content.classList.remove('active');
        });

        // Create search results container
        let searchResultsContainer = document.getElementById('search-results-content');
        if (!searchResultsContainer) {
            searchResultsContainer = document.createElement('div');
            searchResultsContainer.id = 'search-results-content';
            searchResultsContainer.className = 'explore-category-content';
            exploreContent.appendChild(searchResultsContainer);
        }

        searchResultsContainer.classList.add('active');
        searchResultsContainer.innerHTML = '';

        if (results.length === 0) {
            searchResultsContainer.innerHTML = `
                <div style="padding: 32px 16px; text-align: center; color: #71767B;">
                    <i class="fas fa-search" style="font-size: 48px; margin-bottom: 16px; display: block;"></i>
                    <h3>No results found</h3>
                    <p>Try searching for something else</p>
                </div>
            `;
            return;
        }

        const resultsHeader = document.createElement('h3');
        resultsHeader.textContent = `Search results (${results.length})`;
        resultsHeader.style.cssText = 'font-size: 20px; font-weight: 700; color: #E7E9EA; margin-bottom: 16px; padding: 16px 16px 0;';
        searchResultsContainer.appendChild(resultsHeader);

        const resultsContainer = document.createElement('div');
        resultsContainer.style.padding = '0 16px';
        searchResultsContainer.appendChild(resultsContainer);

        results.forEach(result => {
            resultsContainer.appendChild(result);
        });
    }

    // Handle post creation
    async handleCreatePost() {
        const content = document.getElementById('post-content').value.trim();
        const mediaFile = document.getElementById('media-input').files[0];

        if (!content && !mediaFile) {
            this.showError('Post cannot be empty');
            return;
        }

        if (content.length > this.characterLimit) {
            this.showError(`Post cannot exceed ${this.characterLimit} characters`);
            return;
        }

        try {
            this.setLoadingState(true);
            
            // Prepare post data according to database schema
            const postData = {
                textContent: content,
                date: new Date()
            };

            // Handle visual content if media file is provided
            if (mediaFile) {
                // For now, we'll store the file as a data URL
                // In production, you'd upload to a file storage service
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const visualContentData = {
                        content: e.target.result, // Data URL
                        mimeType: mediaFile.type,
                        mediaType: mediaFile.type.startsWith('image/') ? 'image' : 
                                  mediaFile.type.startsWith('video/') ? 'video' : 'other',
                        fileName: mediaFile.name,
                        fileSizeBytes: mediaFile.size
                    };
                    
                    // Create visual content first, then create post
                    try {
                        const visualContentResponse = await fetch(`${this.apiService.baseURL}/visual-content`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(visualContentData)
                        });
                        
                        if (visualContentResponse.ok) {
                            const visualContent = await visualContentResponse.json();
                            postData.visualContent = visualContent._id;
                        }
                        
                        // Create the post
                        await this.createPostWithData(postData);
                    } catch (error) {
                        console.error('Error creating visual content:', error);
                        // Create post without visual content
                        await this.createPostWithData(postData);
                    }
                };
                reader.readAsDataURL(mediaFile);
            } else {
                // Create post without visual content
                await this.createPostWithData(postData);
            }
            
        } catch (error) {
            console.error('Error creating post:', error);
            this.showError('Failed to create post. Please try again.');
        } finally {
            this.setLoadingState(false);
        }
    }

    // Helper method to create post with data
    async createPostWithData(postData) {
        try {
            const response = await this.apiService.createPost(postData);
            
            if (response.error) {
                throw new Error(response.error);
            }
            
            // Reload posts to show the new one
            await this.loadPosts();
            
            // Reset form
            document.getElementById('post-content').value = '';
            document.getElementById('media-input').value = '';
            this.updateCharacterCount();
            this.updatePostButton();
            
            this.showSuccess('Post created successfully!');
            
        } catch (error) {
            console.error('Error creating post:', error);
            this.showError('Failed to create post. Please try again.');
        }
    }

    // Handle search functionality
    handleSearch(query) {
        if (!query.trim()) {
            this.renderPosts();
            return;
        }

        const results = this.posts.filter(post => 
            post.content.toLowerCase().includes(query.toLowerCase()) ||
            post.author.name.toLowerCase().includes(query.toLowerCase()) ||
            post.author.username.toLowerCase().includes(query.toLowerCase())
        );

        this.renderPosts(results);
    }

    // Switch tabs
    switchTab(clickedTab) {
        document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');
        
        // Mock different feeds
        if (clickedTab.textContent === 'Following') {
            this.showSuccess('Switched to Following feed');
        } else {
            this.showSuccess('Switched to For you feed');
        }
    }

    // Handle follow button
    async handleFollow(button) {
        const isFollowing = button.textContent === 'Following';
        const username = button.dataset.username;
        
        if (!username) {
            console.error('No username found for follow button');
            return;
        }

        try {
            if (isFollowing) {
                // Unfollow user
                await this.apiService.unfollowUser(this.currentUser.username, username);
                button.textContent = 'Follow';
                button.style.backgroundColor = '#E7E9EA';
                button.style.color = '#000000';
                this.showSuccess('Unfollowed user');
            } else {
                // Follow user
                await this.apiService.followUser(username);
                button.textContent = 'Following';
                button.style.backgroundColor = '#000000';
                button.style.color = '#FFFFFF';
                this.showSuccess('Followed user');
            }
        } catch (error) {
            console.error('Error handling follow:', error);
            this.showError('Failed to update follow status. Please try again.');
        }
    }

    // Load posts from API
    async loadPosts() {
        try {
            this.setLoadingState(true);
            
            // Get posts from followed users
            const response = await this.apiService.getFeedPosts();
            
            if (response.error) {
                throw new Error(response.error);
            }
            
            // Transform database posts to frontend format
            this.posts = await this.transformPostsForDisplay(response);
            this.renderPosts();
            
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError('Failed to load posts');
            
            // Fallback to mock data for demonstration
            this.loadMockPosts();
        } finally {
            this.setLoadingState(false);
        }
    }

    // Transform database posts to frontend display format
    async transformPostsForDisplay(dbPosts) {
        const transformedPosts = [];
        
        for (const post of dbPosts) {
            try {
                // Get user information for the post author
                const userResponse = await this.apiService.getUser(post.username);
                const author = userResponse.error ? 
                    { name: post.username, username: post.username, avatar: 'https://via.placeholder.com/48/1DA1F2/ffffff?text=' + post.username.charAt(0).toUpperCase() } :
                    userResponse;

                // Get visual content if exists
                let media = null;
                let mediaType = null;
                if (post.visualContent) {
                    try {
                        const visualResponse = await fetch(`${this.apiService.baseURL}/visual-content/${post.visualContent}`);
                        if (visualResponse.ok) {
                            const visualContent = await visualResponse.json();
                            media = visualContent.content;
                            mediaType = visualContent.mediaType;
                        }
                    } catch (error) {
                        console.error('Error loading visual content:', error);
                    }
                }

                // Check if current user liked this post
                const isLiked = this.likes.has(post._id);

                const transformedPost = {
                    id: post.postId,
                    content: post.textContent,
                    author: {
                        id: author._id || author.username,
                        name: author.name || author.username,
                        username: author.username,
                        avatar: author.avatar || 'https://cdn-icons-png.freepik.com/512/4159/4159471.png'
                    },
                    createdAt: post.date,
                    media: media,
                    mediaType: mediaType,
                    likes: post.likes || 0,
                    retweets: 0, // TODO: Implement retweet counting
                    replies: 0, // TODO: Implement reply counting
                    views: 0, // TODO: Implement view counting
                    isLiked: post.isLikedByUser,
                    isRetweeted: false // TODO: Implement retweet tracking
                };

                transformedPosts.push(transformedPost);
            } catch (error) {
                console.error('Error transforming post:', error);
            }
        }
        transformedPosts.sort((postA, postB) => new Date(postB.createdAt) - new Date(postA.createdAt));

        return transformedPosts;
    }

    // Fallback mock posts for demonstration
    loadMockPosts() {
        const mockPosts = [
            {
                id: 'post-1',
                content: 'Just finished my research paper on machine learning algorithms! The results are promising and I can\'t wait to share them with the academic community. #MachineLearning #Research #AI',
                author: { 
                    id: 'user-2', 
                    name: 'Jane Smith', 
                    username: 'janesmith',
                    avatar: 'https://via.placeholder.com/48/28a745/ffffff?text=JS' 
                },
                createdAt: new Date(Date.now() - 3600000).toISOString(),
                media: null,
                mediaType: null,
                likes: 15,
                retweets: 8,
                replies: 12,
                views: 1250,
                isLiked: false,
                isRetweeted: false
            },
            {
                id: 'post-2',
                content: 'Check out this amazing visualization of our data analysis! The patterns we discovered are incredible.',
                author: { 
                    id: 'user-3', 
                    name: 'Bob Wilson', 
                    username: 'bobwilson',
                    avatar: 'https://via.placeholder.com/48/dc3545/ffffff?text=BW' 
                },
                createdAt: new Date(Date.now() - 7200000).toISOString(),
                media: 'https://via.placeholder.com/600/400/1DA1F2?text=Data+Visualization',
                mediaType: 'image',
                likes: 23,
                retweets: 12,
                replies: 8,
                views: 2100,
                isLiked: false,
                isRetweeted: false
            }
        ];

        this.posts = mockPosts;
        this.renderPosts();
    }

    // Render posts to DOM
    renderPosts(postsToRender = this.posts) {
        const container = document.getElementById('posts-container');
        
        if (postsToRender === this.posts) {
            container.innerHTML = '';
        }
        
        postsToRender.forEach(post => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
        });
    }

    // Create individual post element
    createPostElement(post) {
        const postDiv = document.createElement('div');
        postDiv.className = 'post fade-in';
        postDiv.dataset.postId = post.id;
        
        const isOwnPost = post.author.id === this.currentUser.id;
        
        postDiv.innerHTML = `
            <img src="${post.author.avatar}" alt="${post.author.name}" class="post-avatar">
            <div class="post-content">
                <div class="post-header">
                    <span class="post-author">${post.author.name}</span>
                    <span class="post-username">@${post.author.username}</span>
                    <span class="post-time">${this.formatDate(post.createdAt)}</span>
                    ${isOwnPost ? '<i class="fas fa-ellipsis-h" style="margin-left: auto; color: #71767B; cursor: pointer;"></i>' : ''}
                </div>
                
                <div class="post-text">${this.formatPostText(post.content)}</div>
                ${post.media ? this.renderMedia(post.media, post.mediaType) : ''}
                
                <div class="post-actions">
                    <div class="post-action reply" onclick="xFeedManager.handleReply('${post.id}')">
                        <i class="far fa-comment"></i>
                        <span>${post.replies}</span>
                    </div>
                    <div class="post-action like ${post.isLiked ? 'liked' : ''}" onclick="xFeedManager.handleLike('${post.id}')">
                        <i class="${post.isLiked ? 'fas' : 'far'} fa-heart"></i>
                        <span>${post.likes}</span>
                    </div>
                </div>
            </div>
        `;
        
        return postDiv;
    }

    // Render media content
    renderMedia(mediaUrl, mediaType) {
        if (mediaType === 'image') {
            return `<div class="post-media">
                <img src="${mediaUrl}" alt="Post media" class="img-fluid">
            </div>`;
        } else if (mediaType === 'video') {
            return `<div class="post-media">
                <video controls class="img-fluid">
                    <source src="${mediaUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
            </div>`;
        }
        return '';
    }

    // Handle post interactions
    handleReply(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            document.getElementById('post-content').value = `@${post.author.username} `;
            document.getElementById('post-content').focus();
            this.updateCharacterCount();
            this.updatePostButton();
        }
    }

    handleRetweet(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.isRetweeted = !post.isRetweeted;
            post.retweets += post.isRetweeted ? 1 : -1;
            this.renderPosts();
            this.showSuccess(post.isRetweeted ? 'Retweeted!' : 'Undid retweet');
        }
    }

    async handleLike(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        try {
            const isCurrentlyLiked = post.isLiked;
            
            if (isCurrentlyLiked) {
                // Unlike the post
                await this.unlikePost(postId);
                this.likes.delete(postId);
                post.isLiked = false;
                post.likes = Math.max(0, post.likes - 1);
            } else {
                // Like the post
                await this.likePost(postId);
                this.likes.set(postId, true);
                post.isLiked = true;
                post.likes += 1;
            }
            
            this.renderPosts();
        } catch (error) {
            console.error('Error handling like:', error);
            this.showError('Failed to update like. Please try again.');
        }
    }

    // Like a post
    async likePost(postId) {
        const response = await fetch(`${this.apiService.baseURL}/likes`, {
            method: 'POST',
            credentials: 'include', // <-- Add this line
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: this.currentUser._id || this.currentUser.id,
                postId: postId
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to like post');
        }
        
        return response.json();
    }

    // Unlike a post
    async unlikePost(postId) {
        const response = await fetch(`${this.apiService.baseURL}/likes`, {
            method: 'DELETE',
            credentials: 'include', 
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: this.currentUser._id || this.currentUser.id,
                postId: postId
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to unlike post');
        }
        
        return response.json();
    }

    handleShare(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post && navigator.share) {
            navigator.share({
                title: 'Check out this post',
                text: post.content.substring(0, 100) + '...',
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
            this.showSuccess('Link copied to clipboard!');
        }
    }

    // Handle media preview
    handleMediaPreview(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('Media file selected:', file.name);
            this.updatePostButton();
        };
        reader.readAsDataURL(file);
    }

    // Update character count
    updateCharacterCount() {
        const content = document.getElementById('post-content').value;
        const remaining = this.characterLimit - content.length;
        
        // Remove existing character count display
        const existingCount = document.querySelector('.character-count');
        if (existingCount) {
            existingCount.remove();
        }
        
        // Add character count if there's content
        if (content.length > 0) {
            const countDiv = document.createElement('div');
            countDiv.className = 'character-count';
            countDiv.style.cssText = `
                position: absolute;
                right: 80px;
                bottom: 12px;
                color: ${remaining < 0 ? '#F4212E' : remaining < 20 ? '#FFD700' : '#71767B'};
                font-size: 13px;
            `;
            countDiv.textContent = remaining;
            
            const composerActions = document.querySelector('.composer-actions');
            composerActions.style.position = 'relative';
            composerActions.appendChild(countDiv);
        }
    }

    followUser(username){
        this.apiService.followUser(username)
        .then(response => {
            console.log('Followed user:', response);
            this.showSuccess(`You followed @${username}`);
        })
        .catch(error => {
            console.error('Error following user:', error);
            this.showError('Failed to follow user. Please try again later.');
        });
    }

    getExistingUsersToFollow(){
                    //         <div class="follow-suggestion">
                    //     <img src="https://via.placeholder.com/40/28a745/ffffff?text=JS" alt="Profile" class="suggestion-avatar">
                    //     <div class="suggestion-info">
                    //         <div class="suggestion-name">Jane Smith</div>
                    //         <div class="suggestion-handle">@janesmith</div>
                    //     </div>
                    //     <button class="follow-btn">Follow</button>
                    // </div>

        this.apiService.getExistingUsers()
        .then(users => {
            this.existingUsers = users;
            console.log('Existing users:', this.existingUsers);
            for (const user of this.existingUsers) {
                if (user.username === this.currentUser.username) continue; // Skip current user
                const suggestionDiv = document.createElement('div');
                suggestionDiv.className = 'follow-suggestion fade-in';
                suggestionDiv.innerHTML = `
                    <img src="https://cdn-icons-png.freepik.com/512/4159/4159471.png" alt="Profile" class="suggestion-avatar">
                    <div class="suggestion-info">
                        <div class="suggestion-name">${user.name || user.username}</div>
                        <div class="suggestion-handle">@${user.username}</div>
                    </div>
                    <button class="follow-btn" id="follow-btn-${user.username}")">Follow</button>`;
                document.getElementById('who-to-follow').appendChild(suggestionDiv);
                document.getElementById(`follow-btn-${user.username}`).addEventListener('click', (e) => {
                    this.followUser(user.username);
                    e.target.textContent = user.isFollowed ? 'Following' : 'Follow';
                    e.target.disabled = true;
                    e.target.style.backgroundColor = '#000000';
                    e.target.style.color = '#FFFFFF';
                });
            }
        })
        .catch(error => {
            console.error('Error fetching users:', error);
            this.showError('Failed to load users. Please try again later.');
        });
    }

    getOwnUser(){
        this.apiService.getOwnUser()
        .then(user => {
            this.currentUser = user;
            console.log('Current user:', this.currentUser);
            const profilePhoto = document.getElementById("user-profile");
            const profileName = document.getElementById("profile-name");
            const profileUsername = document.getElementById("profile-username");

            profilePhoto.src = this.currentUser.userPhotoUrl || 'https://via.placeholder.com/40/1DA1F2/ffffff?text=JD';
            profileName.textContent = this.currentUser.name || 'John Doe';
            profileUsername.textContent = this.currentUser.username || '@johndoe';
        })
        .catch(error => {
            console.error('Error fetching current user:', error);
            this.showError('Failed to load user data. Please log in again.');
        });
    }

    // Update post button state
    updatePostButton() {
        const content = document.getElementById('post-content').value.trim();
        const mediaFile = document.getElementById('media-input').files[0];
        const submitBtn = document.getElementById('post-submit-btn');
        
        const hasContent = content.length > 0 || mediaFile;
        const withinLimit = content.length <= this.characterLimit;
        
        submitBtn.disabled = !hasContent || !withinLimit;
    }

    // Utility functions
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'now';
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    formatPostText(text) {
        // Convert hashtags to clickable links
        return text.replace(/#(\w+)/g, '<span style="color: #1D9BF0; cursor: pointer;">#$1</span>');
    }

    setLoadingState(loading) {
        this.isLoading = loading;
        const submitBtn = document.getElementById('post-submit-btn');
        
        if (loading) {
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;
        } else {
            submitBtn.textContent = 'Post';
            this.updatePostButton();
        }
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showMessage(message, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message fade-in`;
        messageDiv.textContent = message;
        
        const main = document.querySelector('.x-main');
        main.insertBefore(messageDiv, main.firstChild);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Cleanup method for weather timer
    cleanup() {
        if (this.weatherRefreshTimer) {
            clearInterval(this.weatherRefreshTimer);
            this.weatherRefreshTimer = null;
        }
    }
}

// Initialize the X feed manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.xFeedManager = new XFeedManager();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.xFeedManager) {
        window.xFeedManager.cleanup();
    }
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XFeedManager;
}

