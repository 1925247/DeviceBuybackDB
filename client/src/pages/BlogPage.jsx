import React, { useState } from 'react';
import { Search, Calendar, User, ArrowRight, Tag } from 'lucide-react';

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Posts' },
    { id: 'tips', name: 'Selling Tips' },
    { id: 'tech', name: 'Tech News' },
    { id: 'guides', name: 'How-to Guides' },
    { id: 'market', name: 'Market Trends' }
  ];

  const blogPosts = [
    {
      id: 1,
      title: 'How to Get the Best Price for Your Old iPhone',
      excerpt: 'Learn the essential steps to maximize your iPhone\'s resale value, from proper cleaning to timing your sale.',
      category: 'tips',
      author: 'Sarah Johnson',
      date: '2024-01-15',
      readTime: '5 min read',
      image: '/api/placeholder/400/200',
      tags: ['iPhone', 'tips', 'pricing']
    },
    {
      id: 2,
      title: 'The Ultimate Guide to Preparing Your Device for Sale',
      excerpt: 'Everything you need to know about cleaning, backing up data, and factory resetting your device before selling.',
      category: 'guides',
      author: 'Mike Chen',
      date: '2024-01-12',
      readTime: '8 min read',
      image: '/api/placeholder/400/200',
      tags: ['preparation', 'data', 'security']
    },
    {
      id: 3,
      title: 'Smartphone Market Trends: What\'s Hot in 2024',
      excerpt: 'Discover which devices are in highest demand and commanding the best prices in today\'s market.',
      category: 'market',
      author: 'Emily Rodriguez',
      date: '2024-01-10',
      readTime: '6 min read',
      image: '/api/placeholder/400/200',
      tags: ['market', 'trends', '2024']
    },
    {
      id: 4,
      title: 'Why Selling Online Beats Trade-ins Every Time',
      excerpt: 'Compare the benefits of selling your device online versus trading it in at carriers or retailers.',
      category: 'tips',
      author: 'David Park',
      date: '2024-01-08',
      readTime: '4 min read',
      image: '/api/placeholder/400/200',
      tags: ['comparison', 'trade-in', 'online']
    },
    {
      id: 5,
      title: 'Understanding Device Condition: What Buyers Look For',
      excerpt: 'Learn how to accurately assess your device\'s condition and what factors most impact pricing.',
      category: 'guides',
      author: 'Lisa Wang',
      date: '2024-01-05',
      readTime: '7 min read',
      image: '/api/placeholder/400/200',
      tags: ['condition', 'assessment', 'pricing']
    },
    {
      id: 6,
      title: 'The Environmental Impact of Device Recycling',
      excerpt: 'Discover how selling your old devices contributes to environmental sustainability and reduces e-waste.',
      category: 'tech',
      author: 'James Wilson',
      date: '2024-01-03',
      readTime: '5 min read',
      image: '/api/placeholder/400/200',
      tags: ['environment', 'recycling', 'sustainability']
    }
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Cash Old Device Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Tips, guides, and insights to help you get the most value from your devices
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Post */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Article</h2>
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
              <div className="md:w-1/2">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-64 md:h-full object-cover"
                />
              </div>
              <div className="md:w-1/2 p-8">
                <div className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                    {categories.find(cat => cat.id === featuredPost.category)?.name}
                  </span>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-1" />
                    {featuredPost.date}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {featuredPost.title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{featuredPost.author}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span className="text-sm text-gray-600">{featuredPost.readTime}</span>
                  </div>
                  <button className="flex items-center text-blue-600 hover:text-blue-700 font-medium">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Category Filter */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="lg:col-span-3">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredPosts.slice(1).map(post => (
                  <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3">
                          {categories.find(cat => cat.id === post.category)?.name}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          {post.date}
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-3 w-3 mr-1" />
                          {post.author}
                          <span className="mx-2">•</span>
                          {post.readTime}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {post.tags.slice(0, 2).map(tag => (
                            <span key={tag} className="flex items-center text-xs text-gray-500">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          Read More →
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Articles Found</h3>
                <p className="text-gray-600 mb-4">
                  No articles match your search criteria. Try different keywords or browse all categories.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Newsletter Signup */}
        <section className="mt-16 bg-blue-600 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Stay Updated with Our Latest Tips
          </h2>
          <p className="text-blue-100 mb-6">
            Get the latest device selling tips, market trends, and guides delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="px-6 py-2 bg-white text-blue-600 rounded-md hover:bg-gray-50 font-medium">
              Subscribe
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BlogPage;