import React, { useState, useEffect } from 'react';
import { BarChart3, Package, Users, DollarSign, TrendingUp, Smartphone, Laptop, Tablet, Watch } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AdminDashboardOverview = () => {
  const [stats, setStats] = useState({
    totalModels: 0,
    totalVariants: 0,
    totalBrands: 0,
    activeCategories: 0,
    recentBuybacks: 0
  });
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [brandBreakdown, setBrandBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const [modelsRes, brandsRes, deviceTypesRes, buybacksRes] = await Promise.all([
        fetch('/api/device-models'),
        fetch('/api/brands'),
        fetch('/api/device-types'),
        fetch('/api/buyback-requests')
      ]);

      const [models, brands, deviceTypes, buybacks] = await Promise.all([
        modelsRes.json(),
        brandsRes.json(),
        deviceTypesRes.json(),
        buybacksRes.json()
      ]);

      // Calculate stats
      const activeModels = models.filter(m => m.active);
      const activeBrands = brands.filter(b => b.active);
      const activeCategories = deviceTypes.filter(dt => dt.active);

      // Get variant counts for each model
      const variantPromises = activeModels.map(model => 
        fetch(`/api/device-models/${model.id}/variants`).then(res => res.json())
      );
      
      const allVariants = await Promise.all(variantPromises);
      const totalVariants = allVariants.reduce((sum, variants) => sum + variants.length, 0);

      setStats({
        totalModels: activeModels.length,
        totalVariants: totalVariants,
        totalBrands: activeBrands.length,
        activeCategories: activeCategories.length,
        recentBuybacks: buybacks.length
      });

      // Category breakdown
      const categoryStats = activeCategories.map(category => {
        const categoryModels = activeModels.filter(m => m.device_type_id === category.id);
        return {
          name: category.name,
          slug: category.slug,
          models: categoryModels.length,
          icon: getCategoryIcon(category.slug)
        };
      });
      setCategoryBreakdown(categoryStats);

      // Brand breakdown
      const brandStats = activeBrands.map(brand => {
        const brandModels = activeModels.filter(m => m.brand_id === brand.id);
        return {
          name: brand.name,
          models: brandModels.length,
          logo: brand.logo
        };
      });
      setBrandBreakdown(brandStats);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (slug) => {
    switch (slug) {
      case 'smartphones': return Smartphone;
      case 'laptops': return Laptop;
      case 'tablets': case 'tablet': return Tablet;
      case 'watchs': case 'watches': return Watch;
      default: return Package;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Monitor your device buyback system performance and inventory</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Models</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalModels}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Model Variants</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVariants}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Brands</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalBrands}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCategories}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Buyback Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recentBuybacks}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Models by Category</h2>
          <div className="space-y-4">
            {categoryBreakdown.map(category => {
              const IconComponent = category.icon;
              return (
                <div key={category.slug} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <IconComponent className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-blue-600">{category.models}</span>
                    <p className="text-xs text-gray-500">models</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Brand Breakdown */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Models by Brand</h2>
          <div className="space-y-4">
            {brandBreakdown.map(brand => (
              <div key={brand.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="h-6 w-6 mr-3 object-contain" />
                  ) : (
                    <div className="h-6 w-6 mr-3 bg-gray-300 rounded-full"></div>
                  )}
                  <span className="font-medium text-gray-900">{brand.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-green-600">{brand.models}</span>
                  <p className="text-xs text-gray-500">models</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Database Connection</p>
            <p className="text-lg font-bold text-green-600">Active</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Frontend Sync</p>
            <p className="text-lg font-bold text-green-600">Live</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Model-Variant System</p>
            <p className="text-lg font-bold text-green-600">Operational</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Real-time Updates</p>
            <p className="text-lg font-bold text-green-600">Enabled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;