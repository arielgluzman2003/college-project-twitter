// X (Twitter) Platform Clone - JavaScript

class XFeedManager {
    constructor() {
        this.currentUser = null;
        this.posts = [];
        this.currentPage = 1;
        this.isLoading = false;
        this.characterLimit = 280;
        
        this.init();
    }

    async init() {
        try {
            await this.loadCurrentUser();
            this.setupEventListeners();
            this.loadPosts();
            this.updateCharacterCount();
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

        // Tab switching
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn));
        });

        // Follow buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('follow-btn')) {
                this.handleFollow(e.target);
            }
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
}

// Initialize the X feed manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.xFeedManager = new XFeedManager();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = XFeedManager;
}

