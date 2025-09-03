// X (Twitter) Platform Clone - JavaScript

class XFeedManager {
    constructor() {
        this.currentUser = null;
        this.posts = [];
        this.currentPage = 1;
        this.isLoading = false;
        this.characterLimit = 280;
        this.currentSection = 'home';
        this.currentCategory = 'for-you';
        
        // Weather Widget Configuration
        this.weatherConfig = {
            apiKey: 'YOUR_OPENWEATHERMAP_API_KEY', // TODO: Replace with actual API key
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
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError('Failed to initialize the feed');
        }
    }

    // Load current user data
    async loadCurrentUser() {
        try {
            // Mock data for demonstration
            this.currentUser = {
                id: 'user-1',
                name: 'John Doe',
                username: 'johndoe',
                email: 'john.doe@university.edu',
                avatar: 'https://via.placeholder.com/48/1DA1F2/ffffff?text=JD'
            };
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
            
            // Mock post creation
            const newPost = {
                id: `post-${Date.now()}`,
                content: content,
                author: this.currentUser,
                createdAt: new Date().toISOString(),
                media: mediaFile ? URL.createObjectURL(mediaFile) : null,
                mediaType: mediaFile ? mediaFile.type.startsWith('image/') ? 'image' : 'video' : null,
                likes: 0,
                retweets: 0,
                replies: 0,
                views: 0,
                isLiked: false,
                isRetweeted: false
            };

            this.posts.unshift(newPost);
            this.renderPosts();
            
            // Reset form
            document.getElementById('post-content').value = '';
            document.getElementById('media-input').value = '';
            this.updateCharacterCount();
            this.updatePostButton();
            
            this.showSuccess('Post created successfully!');
            
        } catch (error) {
            console.error('Error creating post:', error);
            this.showError('Failed to create post. Please try again.');
        } finally {
            this.setLoadingState(false);
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
    handleFollow(button) {
        const isFollowing = button.textContent === 'Following';
        button.textContent = isFollowing ? 'Follow' : 'Following';
        button.style.backgroundColor = isFollowing ? '#E7E9EA' : '#000000';
        button.style.color = isFollowing ? '#000000' : '#FFFFFF';
        
        this.showSuccess(isFollowing ? 'Unfollowed user' : 'Followed user');
    }

    // Load posts from API
    async loadPosts() {
        try {
            this.setLoadingState(true);
            
            // Mock data for demonstration
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
                },
                {
                    id: 'post-3',
                    content: 'Here\'s a quick tutorial on implementing neural networks from scratch. Hope this helps someone out there! #NeuralNetworks #Tutorial #Coding',
                    author: this.currentUser,
                    createdAt: new Date(Date.now() - 10800000).toISOString(),
                    media: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
                    mediaType: 'video',
                    likes: 45,
                    retweets: 20,
                    replies: 15,
                    views: 3400,
                    isLiked: true,
                    isRetweeted: false
                }
            ];

            this.posts = [...this.posts, ...mockPosts];
            this.renderPosts();
            
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError('Failed to load posts');
        } finally {
            this.setLoadingState(false);
        }
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

    handleLike(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (post) {
            post.isLiked = !post.isLiked;
            post.likes += post.isLiked ? 1 : -1;
            this.renderPosts();
        }
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

