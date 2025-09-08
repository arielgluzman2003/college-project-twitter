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
    async followUser(followingUser, followedUser) {
        const response = await fetch(`${this.baseURL}/follows`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ followingUser, followedUser })
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

    // Group API methods
    async createGroup(groupData) {
        const response = await fetch(`${this.baseURL}/groups`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(groupData)
        });
        return response.json();
    }

    async getAllGroups() {
        const response = await fetch(`${this.baseURL}/groups`);
        return response.json();
    }

    async getGroupById(id) {
        const response = await fetch(`${this.baseURL}/groups/${id}`);
        return response.json();
    }

    async joinGroup(groupId, username) {
        const response = await fetch(`${this.baseURL}/groups/join`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupId, username })
        });
        return response.json();
    }

    async leaveGroup(groupId, username) {
        const response = await fetch(`${this.baseURL}/groups/leave`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ groupId, username })
        });
        return response.json();
    }

    // Search API methods
    async searchPosts(query, filters = {}) {
        const response = await fetch(`${this.baseURL}/posts/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, filters })
        });
        return response.json();
    }

    async searchGroups(query, filters = {}) {
        const response = await fetch(`${this.baseURL}/groups/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query, filters })
        });
        return response.json();
    }

    // Statistics API methods
    async getPostStats() {
        const response = await fetch(`${this.baseURL}/posts/stats`);
        return response.json();
    }

    async getGroupStats() {
        const response = await fetch(`${this.baseURL}/groups/stats`);
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
        
        // Weather Widget Configuration
        this.weatherConfig = {
            apiKey: 'e5c0b5f0ed680b3c0c57f799ba8e7fc5', // OpenWeatherMap API key
            city: 'London', // Default city - can be changed
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

        // Follow buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('follow-btn')) {
                this.handleFollow(e.target);
            }
        });

        // Weather widget event listeners
        const weatherRefreshBtn = document.getElementById('weather-refresh-btn');
        const weatherRetryBtn = document.getElementById('weather-retry-btn');
        
        if (weatherRefreshBtn) {
            weatherRefreshBtn.addEventListener('click', () => this.refreshWeather());
        }
        
        if (weatherRetryBtn) {
            weatherRetryBtn.addEventListener('click', () => this.refreshWeather());
        }

        // Profile page event listeners
        const profileBackBtn = document.getElementById('profile-back-btn');
        const editProfileBtn = document.getElementById('edit-profile-btn');
        const editCoverBtn = document.getElementById('edit-cover-btn');
        const editAvatarBtn = document.getElementById('edit-avatar-btn');
        
        if (profileBackBtn) {
            profileBackBtn.addEventListener('click', () => this.switchSection('home'));
        }
        
        if (editProfileBtn) {
            editProfileBtn.addEventListener('click', () => this.handleEditProfile());
        }
        
        if (editCoverBtn) {
            editCoverBtn.addEventListener('click', () => this.handleEditCover());
        }
        
        if (editAvatarBtn) {
            editAvatarBtn.addEventListener('click', () => this.handleEditAvatar());
        }

        // Profile tab switching
        const profileTabBtns = document.querySelectorAll('.profile-tab-btn');
        profileTabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchProfileTab(btn));
        });

        // Maps event listeners
        const mapsAddLocationBtn = document.getElementById('maps-add-location-btn');
        const mapsRefreshBtn = document.getElementById('maps-refresh-btn');
        const addLocationBtn = document.getElementById('add-location-btn');
        const modalCloseBtn = document.getElementById('modal-close-btn');
        const modalCancelBtn = document.getElementById('modal-cancel-btn');
        const modalSaveBtn = document.getElementById('modal-save-btn');
        const mapSearchBtn = document.getElementById('map-search-btn');
        const mapTypeBtns = document.querySelectorAll('.map-type-btn');
        const mapZoomInBtn = document.getElementById('map-zoom-in');
        const mapZoomOutBtn = document.getElementById('map-zoom-out');

        if (mapsAddLocationBtn) {
            mapsAddLocationBtn.addEventListener('click', () => this.showAddLocationModal());
        }

        if (mapsRefreshBtn) {
            mapsRefreshBtn.addEventListener('click', () => this.refreshMaps());
        }

        if (addLocationBtn) {
            addLocationBtn.addEventListener('click', () => this.showAddLocationModal());
        }

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => this.hideAddLocationModal());
        }

        if (modalCancelBtn) {
            modalCancelBtn.addEventListener('click', () => this.hideAddLocationModal());
        }

        if (modalSaveBtn) {
            modalSaveBtn.addEventListener('click', () => this.saveLocation());
        }

        if (mapSearchBtn) {
            mapSearchBtn.addEventListener('click', () => this.searchLocation());
        }

        mapTypeBtns.forEach(btn => {
            btn.addEventListener('click', () => this.changeMapType(btn));
        });

        if (mapZoomInBtn) {
            mapZoomInBtn.addEventListener('click', () => this.zoomIn());
        }

        if (mapZoomOutBtn) {
            mapZoomOutBtn.addEventListener('click', () => this.zoomOut());
        }

        // Location action buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.location-action-btn')) {
                const btn = e.target.closest('.location-action-btn');
                const action = btn.title;
                const locationItem = btn.closest('.location-item');
                this.handleLocationAction(action, locationItem);
            }
        });
    }

    // Initialize Weather Widget
    initWeatherWidget() {
        // Check if weather section exists in explore
        if (!document.getElementById('weather-content')) {
            console.warn('Weather section not found in explore page');
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

            // Use the free Current Weather API instead of One Call API 3.0
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(this.weatherConfig.city)}&appid=${this.weatherConfig.apiKey}&units=${this.weatherConfig.units}`;

            const response = await fetch(weatherUrl);
            
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
            // Extract weather information from Current Weather API response
            const cityName = weatherData.name;
            const temperature = Math.round(weatherData.main?.temp);
            const feelsLike = Math.round(weatherData.main?.feels_like);
            const humidity = weatherData.main?.humidity;
            const windSpeed = Math.round(weatherData.wind?.speed * 3.6); // Convert m/s to km/h
            const visibility = Math.round((weatherData.visibility || 0) / 1000); // Convert m to km
            const description = weatherData.weather?.[0]?.description;
            const iconCode = weatherData.weather?.[0]?.icon;

            // Update DOM elements
            const cityElement = document.getElementById('weather-city');
            const tempElement = document.getElementById('weather-temperature');
            const feelsLikeElement = document.getElementById('weather-feels-like');
            const humidityElement = document.getElementById('weather-humidity');
            const windElement = document.getElementById('weather-wind');
            const visibilityElement = document.getElementById('weather-visibility');
            const descriptionElement = document.getElementById('weather-description');
            const iconElement = document.getElementById('weather-icon');

            if (cityElement) cityElement.textContent = cityName;
            if (tempElement) tempElement.textContent = temperature || '--';
            if (feelsLikeElement) feelsLikeElement.textContent = feelsLike || '--';
            if (humidityElement) humidityElement.textContent = humidity || '--';
            if (windElement) windElement.textContent = windSpeed || '--';
            if (visibilityElement) visibilityElement.textContent = visibility || '--';
            if (descriptionElement) descriptionElement.textContent = description || 'Weather description';

            // Update weather icon
            if (iconElement && iconCode) {
                const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
                iconElement.src = iconUrl;
                iconElement.alt = description || 'Weather icon';
            }

            // Show weather content (no forecast data with Current Weather API)
            this.showWeatherContent();

        } catch (error) {
            console.error('Error updating weather widget:', error);
            this.showWeatherError('Failed to update weather display');
        }
    }

    // Update forecast data (not available with Current Weather API)
    updateForecast(dailyData) {
        // Current Weather API doesn't provide forecast data
        // Show a message that forecast is not available
        const forecastContainer = document.querySelector('.forecast-container');
        if (forecastContainer) {
            forecastContainer.innerHTML = `
                <div style="padding: 16px; text-align: center; color: #71767B;">
                    <i class="fas fa-info-circle" style="margin-bottom: 8px; display: block; font-size: 24px;"></i>
                    <p style="margin: 0; font-size: 14px;">Forecast data requires One Call API subscription</p>
                </div>
            `;
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
        const contentElement = document.getElementById('weather-display');
        const errorElement = document.getElementById('weather-error');

        if (loadingElement) loadingElement.style.display = 'block';
        if (contentElement) contentElement.style.display = 'none';
        if (errorElement) errorElement.style.display = 'none';
    }

    // Show weather content
    showWeatherContent() {
        const loadingElement = document.getElementById('weather-loading');
        const contentElement = document.getElementById('weather-display');
        const errorElement = document.getElementById('weather-error');

        if (loadingElement) loadingElement.style.display = 'none';
        if (contentElement) contentElement.style.display = 'block';
        if (errorElement) errorElement.style.display = 'none';
    }

    // Show weather error state
    showWeatherError(message) {
        const loadingElement = document.getElementById('weather-loading');
        const contentElement = document.getElementById('weather-display');
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

    // Switch between main sections (Home/Explore/Profile)
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

        // Handle section-specific logic
        if (section === 'profile') {
            this.loadProfileData();
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

        // Initialize weather widget if weather tab is selected
        if (category === 'weather') {
            this.initWeatherWidget();
        }
        
        // Initialize maps widget if maps tab is selected
        if (category === 'maps') {
            this.initMapsWidget();
        }

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
                await this.apiService.followUser(this.currentUser.username, username);
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
                    id: post._id,
                    content: post.textContent,
                    author: {
                        id: author._id || author.username,
                        name: author.name || author.username,
                        username: author.username,
                        avatar: author.avatar || `https://via.placeholder.com/48/1DA1F2/ffffff?text=${author.username.charAt(0).toUpperCase()}`
                    },
                    createdAt: post.date,
                    media: media,
                    mediaType: mediaType,
                    likes: post.likes || 0,
                    retweets: 0, // TODO: Implement retweet counting
                    replies: 0, // TODO: Implement reply counting
                    views: 0, // TODO: Implement view counting
                    isLiked: isLiked,
                    isRetweeted: false // TODO: Implement retweet tracking
                };

                transformedPosts.push(transformedPost);
            } catch (error) {
                console.error('Error transforming post:', error);
            }
        }

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
                    <div class="post-action retweet ${post.isRetweeted ? 'retweeted' : ''}" onclick="xFeedManager.handleRetweet('${post.id}')">
                        <i class="fas fa-retweet"></i>
                        <span>${post.retweets}</span>
                    </div>
                    <div class="post-action like ${post.isLiked ? 'liked' : ''}" onclick="xFeedManager.handleLike('${post.id}')">
                        <i class="${post.isLiked ? 'fas' : 'far'} fa-heart"></i>
                        <span>${post.likes}</span>
                    </div>
                    <div class="post-action share" onclick="xFeedManager.handleShare('${post.id}')">
                        <i class="far fa-share-square"></i>
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
            const isCurrentlyLiked = this.likes.has(postId);
            
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

    // Profile page methods
    async loadProfileData() {
        try {
            if (!this.currentUser) {
                throw new Error('No current user found');
            }

            // Load user profile data
            const userData = await this.apiService.getUser(this.currentUser.username);
            if (userData.error) {
                throw new Error(userData.error);
            }

            // Update profile display
            this.updateProfileDisplay(userData);
            
            // Load user's posts
            await this.loadUserPosts(this.currentUser.username);
            
        } catch (error) {
            console.error('Error loading profile data:', error);
            this.showError('Failed to load profile data');
        }
    }

    updateProfileDisplay(userData) {
        // Update profile header
        const displayName = document.getElementById('profile-display-name');
        const postCount = document.getElementById('profile-post-count');
        
        if (displayName) displayName.textContent = userData.name || userData.username;
        if (postCount) postCount.textContent = '1,234 posts'; // TODO: Get actual post count

        // Update profile details
        const profileName = document.getElementById('profile-name');
        const profileUsername = document.getElementById('profile-username');
        const profileBio = document.getElementById('profile-bio');
        const profileLocation = document.getElementById('profile-location');
        const profileWebsite = document.getElementById('profile-website');
        const profileJoinDate = document.getElementById('profile-join-date');
        const profileFollowingCount = document.getElementById('profile-following-count');
        const profileFollowersCount = document.getElementById('profile-followers-count');
        const profileAvatar = document.getElementById('profile-avatar');
        const profileCoverPhoto = document.getElementById('profile-cover-photo');

        if (profileName) profileName.textContent = userData.name || userData.username;
        if (profileUsername) profileUsername.textContent = `@${userData.username}`;
        if (profileBio) profileBio.textContent = userData.bio || 'No bio available';
        if (profileLocation) profileLocation.textContent = userData.location || 'No location set';
        if (profileWebsite) {
            profileWebsite.textContent = userData.website || 'No website';
            profileWebsite.href = userData.website || '#';
        }
        if (profileJoinDate) {
            const joinDate = userData.joinedDate ? new Date(userData.joinedDate) : new Date();
            profileJoinDate.textContent = `Joined ${joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
        }
        if (profileFollowingCount) profileFollowingCount.textContent = '1,234'; // TODO: Get actual count
        if (profileFollowersCount) profileFollowersCount.textContent = '5,678'; // TODO: Get actual count
        if (profileAvatar) profileAvatar.src = userData.avatar || `https://via.placeholder.com/120/1DA1F2/ffffff?text=${userData.username.charAt(0).toUpperCase()}`;
        if (profileCoverPhoto) profileCoverPhoto.src = userData.coverPhoto || 'https://via.placeholder.com/600x200/1DA1F2/ffffff?text=Cover+Photo';
    }

    async loadUserPosts(username) {
        try {
            const response = await this.apiService.getFeedPosts(username);
            if (response.error) {
                throw new Error(response.error);
            }

            // Transform and display user's posts
            const userPosts = await this.transformPostsForDisplay(response);
            this.renderProfilePosts(userPosts);
            
        } catch (error) {
            console.error('Error loading user posts:', error);
            this.showError('Failed to load user posts');
        }
    }

    renderProfilePosts(posts) {
        const container = document.getElementById('profile-posts-container');
        if (!container) return;

        container.innerHTML = '';

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-feather-alt"></i>
                    <h3>No posts yet</h3>
                    <p>When you post something, it will show up here.</p>
                </div>
            `;
            return;
        }

        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            container.appendChild(postElement);
        });
    }

    switchProfileTab(clickedTab) {
        // Update tab buttons
        document.querySelectorAll('.profile-tab-btn').forEach(tab => tab.classList.remove('active'));
        clickedTab.classList.add('active');

        const tab = clickedTab.dataset.tab;
        
        // Update content
        document.querySelectorAll('.profile-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`profile-${tab}`).classList.add('active');

        // Load content based on tab
        switch (tab) {
            case 'posts':
                this.loadUserPosts(this.currentUser.username);
                break;
            case 'replies':
                // TODO: Load replies
                break;
            case 'media':
                this.loadUserMedia(this.currentUser.username);
                break;
            case 'likes':
                // TODO: Load liked posts
                break;
        }
    }

    async loadUserMedia(username) {
        try {
            // Get user's posts with media
            const response = await this.apiService.getFeedPosts(username);
            if (response.error) {
                throw new Error(response.error);
            }

            const mediaGrid = document.getElementById('profile-media-grid');
            if (!mediaGrid) return;

            mediaGrid.innerHTML = '';

            // Filter posts with media
            const postsWithMedia = response.filter(post => post.visualContent);
            
            if (postsWithMedia.length === 0) {
                mediaGrid.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-images"></i>
                        <h3>No media yet</h3>
                        <p>When you post photos or videos, they will show up here.</p>
                    </div>
                `;
                return;
            }

            // Display media items
            for (const post of postsWithMedia) {
                try {
                    const visualResponse = await fetch(`${this.apiService.baseURL}/visual-content/${post.visualContent}`);
                    if (visualResponse.ok) {
                        const visualContent = await visualResponse.json();
                        const mediaItem = document.createElement('div');
                        mediaItem.className = 'media-item';
                        
                        if (visualContent.mediaType === 'image') {
                            mediaItem.innerHTML = `<img src="${visualContent.content}" alt="Media">`;
                        } else if (visualContent.mediaType === 'video') {
                            mediaItem.innerHTML = `<video><source src="${visualContent.content}" type="${visualContent.mimeType}"></video>`;
                        }
                        
                        mediaGrid.appendChild(mediaItem);
                    }
                } catch (error) {
                    console.error('Error loading media item:', error);
                }
            }
            
        } catch (error) {
            console.error('Error loading user media:', error);
            this.showError('Failed to load media');
        }
    }

    handleEditProfile() {
        // TODO: Implement profile editing modal
        this.showSuccess('Profile editing feature coming soon!');
    }

    handleEditCover() {
        // TODO: Implement cover photo editing
        this.showSuccess('Cover photo editing feature coming soon!');
    }

    handleEditAvatar() {
        // TODO: Implement avatar editing
        this.showSuccess('Avatar editing feature coming soon!');
    }

    // ===== GOOGLE MAPS INTEGRATION METHODS =====

    // Initialize Maps Widget
    initMapsWidget() {
        // Check if maps section exists
        if (!document.getElementById('maps-content')) {
            console.warn('Maps section not found in explore page');
            return;
        }

        // Initialize Google Maps (placeholder for now)
        this.initializeGoogleMaps();
        
        // Load saved locations
        this.loadSavedLocations();
        
        console.log('Maps widget initialized');
    }

    // Initialize Google Maps (with fallback)
    initializeGoogleMaps() {
        const mapContainer = document.getElementById('google-map');
        if (!mapContainer) return;

        // Check if Google Maps is loaded
        if (typeof google === 'undefined' || !google.maps) {
            console.warn('Google Maps API not available, using fallback implementation');
            this.initializeFallbackMap();
            return;
        }

        // Try to initialize the real Google Maps
        try {
            this.initMap();
        } catch (error) {
            console.error('Error initializing Google Maps:', error);
            this.initializeFallbackMap();
        }
    }

    // Fallback map implementation (works without Google Maps API)
    initializeFallbackMap() {
        const mapContainer = document.getElementById('google-map');
        if (!mapContainer) return;

        // Create a functional map interface without Google Maps API
        mapContainer.innerHTML = `
            <div class="fallback-map">
                <div class="map-header">
                    <h4><i class="fas fa-map-marked-alt"></i> Interactive Map</h4>
                    <p>Location Management System</p>
                </div>
                
                <div class="map-viewport">
                    <div class="map-grid">
                        <div class="map-tile" data-lat="37.7749" data-lng="-122.4194">
                            <div class="location-marker" title="San Francisco, CA">
                                <i class="fas fa-map-pin"></i>
                            </div>
                            <div class="location-label">San Francisco</div>
                        </div>
                        <div class="map-tile" data-lat="40.7128" data-lng="-74.0060">
                            <div class="location-marker" title="New York, NY">
                                <i class="fas fa-map-pin"></i>
                            </div>
                            <div class="location-label">New York</div>
                        </div>
                        <div class="map-tile" data-lat="51.5074" data-lng="-0.1278">
                            <div class="location-marker" title="London, UK">
                                <i class="fas fa-map-pin"></i>
                            </div>
                            <div class="location-label">London</div>
                        </div>
                    </div>
                </div>
                
                <div class="map-info">
                    <p><i class="fas fa-info-circle"></i> Map shows saved locations. Click markers to view details.</p>
                </div>
            </div>
        `;

        // Add click handlers for fallback markers
        this.setupFallbackMapHandlers();
        
        console.log('Fallback map initialized successfully');
    }

    // Setup handlers for fallback map
    setupFallbackMapHandlers() {
        const markers = document.querySelectorAll('.location-marker');
        markers.forEach(marker => {
            marker.addEventListener('click', (e) => {
                const tile = e.target.closest('.map-tile');
                const lat = tile.dataset.lat;
                const lng = tile.dataset.lng;
                const title = e.target.title;
                
                this.showLocationInfo(title, lat, lng);
            });
        });
    }

    // Show location info for fallback map
    showLocationInfo(title, lat, lng) {
        const infoHtml = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                        background: #16181C; border: 1px solid #2F3336; border-radius: 12px; 
                        padding: 20px; z-index: 1000; max-width: 300px; color: #E7E9EA;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                    <h4 style="margin: 0; color: #1D9BF0;">${title}</h4>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: none; border: none; color: #71767B; cursor: pointer; font-size: 18px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <p style="margin: 0 0 8px 0; font-size: 14px;">Coordinates:</p>
                <p style="margin: 0 0 12px 0; font-size: 12px; color: #71767B;">
                    ${lat}° N, ${lng}° W
                </p>
                <button onclick="xFeedManager.centerOnLocation('${title}', ${lat}, ${lng})" 
                        style="background: #1D9BF0; color: white; border: none; padding: 8px 16px; 
                               border-radius: 6px; cursor: pointer; font-size: 14px;">
                    View Details
                </button>
            </div>
        `;
        
        // Remove existing info if any
        const existingInfo = document.querySelector('.location-info-popup');
        if (existingInfo) existingInfo.remove();
        
        // Add new info
        const infoDiv = document.createElement('div');
        infoDiv.className = 'location-info-popup';
        infoDiv.innerHTML = infoHtml;
        document.body.appendChild(infoDiv);
    }

    // Center on location (fallback)
    centerOnLocation(title, lat, lng) {
        // Remove info popup
        const infoPopup = document.querySelector('.location-info-popup');
        if (infoPopup) infoPopup.remove();
        
        // Highlight the location in the list
        const locationItems = document.querySelectorAll('.location-item');
        locationItems.forEach(item => {
            const name = item.querySelector('.location-name').textContent;
            if (name.includes(title.split(',')[0])) {
                item.style.background = '#1D9BF0';
                item.style.borderColor = '#1D9BF0';
                setTimeout(() => {
                    item.style.background = '#000000';
                    item.style.borderColor = '#2F3336';
                }, 2000);
            }
        });
        
        this.showSuccess(`Centered on ${title}`);
    }

    // Initialize the actual Google Map
    initMap() {
        const mapContainer = document.getElementById('google-map');
        if (!mapContainer) return;

        // Default center (San Francisco)
        const defaultCenter = { lat: 37.7749, lng: -122.4194 };
        
        // Create map options
        const mapOptions = {
            zoom: 10,
            center: defaultCenter,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            styles: [
                {
                    featureType: "all",
                    elementType: "geometry",
                    stylers: [{ color: "#242f3e" }]
                },
                {
                    featureType: "all",
                    elementType: "labels.text.stroke",
                    stylers: [{ light: -80 }]
                },
                {
                    featureType: "all",
                    elementType: "labels.text.fill",
                    stylers: [{ color: "#746855" }]
                },
                {
                    featureType: "water",
                    elementType: "geometry",
                    stylers: [{ color: "#17263c" }]
                },
                {
                    featureType: "road",
                    elementType: "geometry",
                    stylers: [{ color: "#38414e" }]
                },
                {
                    featureType: "poi",
                    elementType: "geometry",
                    stylers: [{ color: "#17263c" }]
                }
            ]
        };

        // Create the map
        this.map = new google.maps.Map(mapContainer, mapOptions);
        
        // Initialize markers array
        this.markers = [];
        
        // Add default markers for sample locations
        this.addSampleMarkers();
        
        // Initialize geocoder
        this.geocoder = new google.maps.Geocoder();
        
        // Initialize places service
        this.placesService = new google.maps.places.PlacesService(this.map);
        
        console.log('Google Maps initialized successfully');
    }

    // Add sample markers
    addSampleMarkers() {
        const sampleLocations = [
            {
                name: "San Francisco, CA",
                lat: 37.7749,
                lng: -122.4194,
                description: "Tech hub and cultural center"
            },
            {
                name: "New York, NY", 
                lat: 40.7128,
                lng: -74.0060,
                description: "The Big Apple"
            },
            {
                name: "London, UK",
                lat: 51.5074,
                lng: -0.1278,
                description: "Historic capital city"
            }
        ];

        sampleLocations.forEach(location => {
            this.addMarker(location);
        });
    }

    // Add marker to map
    addMarker(location) {
        if (!this.map) return;

        const marker = new google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: this.map,
            title: location.name,
            animation: google.maps.Animation.DROP
        });

        // Create info window
        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="color: #000; padding: 8px;">
                    <h4 style="margin: 0 0 8px 0; color: #1D9BF0;">${location.name}</h4>
                    <p style="margin: 0; font-size: 14px;">${location.description || 'No description available'}</p>
                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
                        ${location.lat.toFixed(4)}° N, ${location.lng.toFixed(4)}° W
                    </p>
                </div>
            `
        });

        // Add click listener
        marker.addListener('click', () => {
            infoWindow.open(this.map, marker);
        });

        // Store marker reference
        this.markers.push({
            marker: marker,
            location: location,
            infoWindow: infoWindow
        });

        return marker;
    }

    // Add location to the locations list
    addLocationToList(locationData) {
        const locationsList = document.getElementById('locations-list');
        if (!locationsList) return;

        const locationItem = document.createElement('div');
        locationItem.className = 'location-item';
        locationItem.innerHTML = `
            <div class="location-info">
                <div class="location-name">${locationData.name}</div>
                <div class="location-coords">${locationData.lat.toFixed(4)}° N, ${locationData.lng.toFixed(4)}° W</div>
            </div>
            <div class="location-actions">
                <button class="location-action-btn" title="View on Map">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="location-action-btn" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        locationsList.appendChild(locationItem);
    }

    // Load saved locations from database
    async loadSavedLocations() {
        try {
            // TODO: Implement API call to get locations from database
            // For now, use the static locations from HTML
            console.log('Loading saved locations...');
            
            // In a real implementation, you would:
            // 1. Call your backend API to get locations
            // 2. Display them in the locations list
            // 3. Add markers to the map
            
        } catch (error) {
            console.error('Error loading saved locations:', error);
            this.showError('Failed to load locations');
        }
    }

    // Show add location modal
    showAddLocationModal() {
        const modal = document.getElementById('add-location-modal');
        if (modal) {
            modal.style.display = 'flex';
            // Clear form
            this.clearLocationForm();
        }
    }

    // Hide add location modal
    hideAddLocationModal() {
        const modal = document.getElementById('add-location-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Clear location form
    clearLocationForm() {
        const inputs = [
            'location-name-input',
            'location-address-input',
            'location-lat-input',
            'location-lng-input',
            'location-description-input'
        ];
        
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) input.value = '';
        });
    }

    // Save new location
    async saveLocation() {
        try {
            const name = document.getElementById('location-name-input').value.trim();
            const address = document.getElementById('location-address-input').value.trim();
            const lat = parseFloat(document.getElementById('location-lat-input').value);
            const lng = parseFloat(document.getElementById('location-lng-input').value);
            const description = document.getElementById('location-description-input').value.trim();

            // Validation
            if (!name) {
                this.showError('Location name is required');
                return;
            }

            if (!address && (isNaN(lat) || isNaN(lng))) {
                this.showError('Either address or coordinates are required');
                return;
            }

            // Create location data
            const locationData = {
                name,
                address,
                lat: lat,
                lng: lng,
                description,
                createdAt: new Date()
            };

            console.log('Saving location:', locationData);
            
            // Add marker to map
            this.addMarker(locationData);
            
            // Add to locations list
            this.addLocationToList(locationData);
            
            // TODO: Call your backend API to save the location to database
            // await this.apiService.saveLocation(locationData);
            
            this.showSuccess('Location saved successfully!');
            this.hideAddLocationModal();
            
        } catch (error) {
            console.error('Error saving location:', error);
            this.showError('Failed to save location');
        }
    }

    // Search for location (with fallback)
    async searchLocation() {
        const searchInput = document.getElementById('map-search-input');
        if (!searchInput) return;

        const query = searchInput.value.trim();
        if (!query) {
            this.showError('Please enter a search term');
            return;
        }

        // Check if we have Google Maps available
        if (this.geocoder && this.map) {
            try {
                this.showSuccess(`Searching for "${query}"...`);
                
                // Use Google Geocoding API
                this.geocoder.geocode({ address: query }, (results, status) => {
                    if (status === 'OK' && results[0]) {
                        const location = results[0];
                        const lat = location.geometry.location.lat();
                        const lng = location.geometry.location.lng();
                        
                        // Center map on found location
                        this.map.setCenter({ lat, lng });
                        this.map.setZoom(15);
                        
                        // Add marker for search result
                        const searchMarker = new google.maps.Marker({
                            position: { lat, lng },
                            map: this.map,
                            title: location.formatted_address,
                            animation: google.maps.Animation.BOUNCE
                        });

                        // Create info window for search result
                        const infoWindow = new google.maps.InfoWindow({
                            content: `
                                <div style="color: #000; padding: 8px;">
                                    <h4 style="margin: 0 0 8px 0; color: #1D9BF0;">Search Result</h4>
                                    <p style="margin: 0; font-size: 14px;">${location.formatted_address}</p>
                                    <p style="margin: 4px 0 0 0; font-size: 12px; color: #666;">
                                        ${lat.toFixed(4)}° N, ${lng.toFixed(4)}° W
                                    </p>
                                    <button onclick="xFeedManager.addSearchResultToLocations('${location.formatted_address}', ${lat}, ${lng})" 
                                            style="margin-top: 8px; padding: 4px 8px; background: #1D9BF0; color: white; border: none; border-radius: 4px; cursor: pointer;">
                                        Add to Locations
                                    </button>
                                </div>
                            `
                        });

                        infoWindow.open(this.map, searchMarker);
                        
                        this.showSuccess(`Found: ${location.formatted_address}`);
                    } else {
                        this.showError('Location not found. Please try a different search term.');
                    }
                });
                
            } catch (error) {
                console.error('Error searching location:', error);
                this.showError('Failed to search location');
            }
        } else {
            // Fallback search functionality
            this.searchLocationFallback(query);
        }
    }

    // Fallback search functionality
    searchLocationFallback(query) {
        // Mock search results for common locations
        const mockLocations = {
            'paris': { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
            'tokyo': { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
            'sydney': { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 },
            'berlin': { name: 'Berlin, Germany', lat: 52.5200, lng: 13.4050 },
            'madrid': { name: 'Madrid, Spain', lat: 40.4168, lng: -3.7038 },
            'rome': { name: 'Rome, Italy', lat: 41.9028, lng: 12.4964 },
            'moscow': { name: 'Moscow, Russia', lat: 55.7558, lng: 37.6176 },
            'dubai': { name: 'Dubai, UAE', lat: 25.2048, lng: 55.2708 }
        };

        const searchTerm = query.toLowerCase();
        let foundLocation = null;

        // Check for exact matches
        for (const [key, location] of Object.entries(mockLocations)) {
            if (searchTerm.includes(key) || location.name.toLowerCase().includes(searchTerm)) {
                foundLocation = location;
                break;
            }
        }

        if (foundLocation) {
            this.showSuccess(`Found: ${foundLocation.name}`);
            this.addSearchResultToLocations(foundLocation.name, foundLocation.lat, foundLocation.lng);
        } else {
            this.showError('Location not found. Try: Paris, Tokyo, Sydney, Berlin, Madrid, Rome, Moscow, or Dubai');
        }
    }

    // Add search result to locations
    addSearchResultToLocations(address, lat, lng) {
        // Pre-fill the add location modal
        document.getElementById('location-name-input').value = address;
        document.getElementById('location-address-input').value = address;
        document.getElementById('location-lat-input').value = lat;
        document.getElementById('location-lng-input').value = lng;
        
        // Show the modal
        this.showAddLocationModal();
        
        this.showSuccess('Location details added to form');
    }

    // Change map type
    changeMapType(clickedBtn) {
        if (!this.map) return;

        // Update active button
        document.querySelectorAll('.map-type-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedBtn.classList.add('active');

        const mapType = clickedBtn.dataset.type;
        let googleMapType;
        
        switch (mapType) {
            case 'roadmap':
                googleMapType = google.maps.MapTypeId.ROADMAP;
                break;
            case 'satellite':
                googleMapType = google.maps.MapTypeId.SATELLITE;
                break;
            case 'hybrid':
                googleMapType = google.maps.MapTypeId.HYBRID;
                break;
            case 'terrain':
                googleMapType = google.maps.MapTypeId.TERRAIN;
                break;
            default:
                googleMapType = google.maps.MapTypeId.ROADMAP;
        }
        
        this.map.setMapTypeId(googleMapType);
        this.showSuccess(`Map type changed to ${mapType}`);
    }

    // Zoom in
    zoomIn() {
        if (!this.map) return;

        const currentZoom = this.map.getZoom();
        const newZoom = Math.min(currentZoom + 1, 20);
        this.map.setZoom(newZoom);
        
        // Update zoom level display
        const zoomLevel = document.getElementById('map-zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = newZoom;
        }
        
        console.log('Zooming in to level:', newZoom);
    }

    // Zoom out
    zoomOut() {
        if (!this.map) return;

        const currentZoom = this.map.getZoom();
        const newZoom = Math.max(currentZoom - 1, 1);
        this.map.setZoom(newZoom);
        
        // Update zoom level display
        const zoomLevel = document.getElementById('map-zoom-level');
        if (zoomLevel) {
            zoomLevel.textContent = newZoom;
        }
        
        console.log('Zooming out to level:', newZoom);
    }

    // Refresh maps
    refreshMaps() {
        console.log('Refreshing maps...');
        this.loadSavedLocations();
        this.showSuccess('Maps refreshed');
    }

    // Handle location actions (view, delete)
    handleLocationAction(action, locationItem) {
        const locationName = locationItem.querySelector('.location-name').textContent;
        const coordsText = locationItem.querySelector('.location-coords').textContent;
        
        if (action === 'View on Map') {
            // Extract coordinates from the text
            const coords = coordsText.match(/(-?\d+\.?\d*)/g);
            if (coords && coords.length >= 2) {
                const lat = parseFloat(coords[0]);
                const lng = parseFloat(coords[1]);
                
                // Center map on this location
                this.map.setCenter({ lat, lng });
                this.map.setZoom(15);
                
                // Find and highlight the corresponding marker
                const markerData = this.markers.find(m => 
                    Math.abs(m.location.lat - lat) < 0.001 && 
                    Math.abs(m.location.lng - lng) < 0.001
                );
                
                if (markerData) {
                    markerData.infoWindow.open(this.map, markerData.marker);
                    markerData.marker.setAnimation(google.maps.Animation.BOUNCE);
                    setTimeout(() => {
                        markerData.marker.setAnimation(null);
                    }, 2000);
                }
                
                this.showSuccess(`Centering map on ${locationName}`);
            }
        } else if (action === 'Delete') {
            if (confirm(`Are you sure you want to delete "${locationName}"?`)) {
                // Extract coordinates to find the marker
                const coords = coordsText.match(/(-?\d+\.?\d*)/g);
                if (coords && coords.length >= 2) {
                    const lat = parseFloat(coords[0]);
                    const lng = parseFloat(coords[1]);
                    
                    // Remove marker from map
                    const markerIndex = this.markers.findIndex(m => 
                        Math.abs(m.location.lat - lat) < 0.001 && 
                        Math.abs(m.location.lng - lng) < 0.001
                    );
                    
                    if (markerIndex !== -1) {
                        this.markers[markerIndex].marker.setMap(null);
                        this.markers.splice(markerIndex, 1);
                    }
                }
                
                // Remove from locations list
                locationItem.remove();
                this.showSuccess(`Deleted ${locationName}`);
            }
        }
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

// Global callback function for Google Maps initialization
window.initGoogleMaps = function() {
    console.log('Google Maps API loaded successfully');
    // The map will be initialized when the maps tab is clicked
};

const logOut = () => {
  document.cookie = "sessionId=; Max-Age=0; path=/; SameSite=None; Secure";
  window.location.href = "../Login/Login.html";
};

// Add location to the textarea
const getLocation = () => {
    const postContent = document.getElementById("post-content");
  
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          const locationText = `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          postContent.value += `\n${locationText}`; // Append location to textarea
          console.log(`Added location: ${locationText}`);
        },
        (error) => {
          console.error(`Error getting location: ${error.message}`);
          window.alert(`Error getting location: ${error.message}`);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      window.alert("Geolocation is not supported by this browser.");
    }
  };
  
  const mediaInput = document.getElementById("media-input");
  const imagePreview = document.getElementById("image-preview");
  const mediaBtn = document.getElementById("media-btn");
  
  // Open file picker when the media button is clicked
  mediaBtn.addEventListener("click", () => {
      mediaInput.click();
  });
  
  // Display the selected image in the preview
  mediaInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
  
      if (file && file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (e) => {
              imagePreview.src = e.target.result; // Set the image source to the file data
              imagePreview.style.display = "block"; // Show the image preview
          };
          reader.readAsDataURL(file); // Read the file as a data URL
      } else {
          imagePreview.style.display = "none"; // Hide the preview if no image is selected
          imagePreview.src = ""; // Clear the image source
      }
  });

