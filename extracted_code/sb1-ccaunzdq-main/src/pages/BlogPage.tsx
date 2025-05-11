// /pages/buy/BlogPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Clock, ChevronRight, Search } from "lucide-react";

// Define the type for a blog post
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
}

const BlogPage: React.FC = () => {
  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "How to Get the Best Value for Your Used iPhone",
      excerpt:
        "Learn expert tips on maximizing the resale value of your iPhone and what factors affect its price in the market.",
      image:
        "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Smartphones",
      author: "Sarah Johnson",
      date: "2024-03-15",
      readTime: "5 min read",
    },
    {
      id: 2,
      title: "The Environmental Impact of E-Waste",
      excerpt:
        "Discover how proper electronics recycling can help reduce environmental pollution and conserve valuable resources.",
      image:
        "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Environment",
      author: "Michael Chen",
      date: "2024-03-12",
      readTime: "7 min read",
    },
    {
      id: 3,
      title: "Top 10 Features of the Latest MacBook Pro",
      excerpt:
        "A comprehensive review of the new MacBook Pro features and why it's worth considering for your next upgrade.",
      image:
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Laptops",
      author: "David Wilson",
      date: "2024-03-10",
      readTime: "8 min read",
    },
    {
      id: 4,
      title: "The Rise of Sustainable Tech",
      excerpt:
        "How tech companies are embracing sustainability and what it means for consumers and the environment.",
      image:
        "https://images.unsplash.com/photo-1516937941344-00b4e0337589?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Technology",
      author: "Emma Davis",
      date: "2024-03-08",
      readTime: "6 min read",
    },
    {
      id: 5,
      title: "Smart Home Devices Worth Investing In",
      excerpt:
        "A guide to the most valuable smart home devices that can enhance your living space and daily routine.",
      image:
        "https://images.unsplash.com/photo-1558002038-876f1d0aa8ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Smart Home",
      author: "Alex Thompson",
      date: "2024-03-05",
      readTime: "9 min read",
    },
    {
      id: 6,
      title: "Data Security When Selling Your Device",
      excerpt:
        "Essential steps to protect your personal information when selling or recycling your electronic devices.",
      image:
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      category: "Security",
      author: "Rachel Brown",
      date: "2024-03-03",
      readTime: "4 min read",
    },
  ];

  const allCategories: string[] = [
    "All",
    "Smartphones",
    "Laptops",
    "Environment",
    "Technology",
    "Smart Home",
    "Security",
  ];

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === "All" || post.category === selectedCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Tech Blog & Resources</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Stay updated with the latest tech news, tips, and insights about device trade-ins and sustainable technology.
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-12">
        <div className="flex flex-wrap gap-2 justify-center mb-4 sm:mb-0">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition duration-300 ${
                selectedCategory === category
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800 hover:bg-blue-100"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-500" />
          <input
            type="text"
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Featured Post Section */}
      <div className="mb-12">
        <div className="relative rounded-xl overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80"
            alt="Featured post"
            className="w-full h-[500px] object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent"></div>
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium mb-4 inline-block">
              Featured
            </span>
            <h2 className="text-3xl font-bold mb-4">The Future of Electronics Recycling</h2>
            <p className="text-lg mb-4 max-w-3xl">
              Explore how new technologies and initiatives are revolutionizing the way we recycle and reuse electronic devices.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <span>John Smith</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                <span>March 20, 2024</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2" />
                <span>10 min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition duration-300">
              <div className="h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {post.category}
                </span>
                <h3 className="text-xl font-bold mt-4 mb-2">{post.title}</h3>
                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">No articles found.</p>
        )}
      </div>

      {/* Newsletter Section */}
      <div className="bg-blue-50 rounded-xl p-8 mb-12">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-gray-600 mb-6">
            Get the latest tech news, tips, and exclusive offers delivered straight to your inbox.
          </p>
          <form className="flex gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Popular Topics */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Popular Topics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Smartphone Tips", "E-Waste Management", "Tech Reviews", "Data Security"].map((topic) => (
            <div key={topic} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300">
              <h3 className="font-medium mb-2">{topic}</h3>
              <Link to="#" className="text-blue-600 hover:text-blue-800 flex items-center text-sm">
                View Articles <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}      
      <div className="flex justify-center items-center space-x-2">
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Previous
        </button>
        {[1, 2, 3, 4, 5].map((page) => (
          <button
            key={page}
            className={`px-4 py-2 rounded-lg ${page === 1 ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"}`}
          >
            {page}
          </button>
        ))}
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
          Next
        </button>
      </div>
    </div>
  );
};

export default BlogPage;
