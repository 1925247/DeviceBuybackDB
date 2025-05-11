// /home/project/src/pages/admin/AdminModels.tsx
import React, { useState } from 'react';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Model, deviceModels as initialModels } from '/home/project/src/db/models';
import { deviceTypeOptions } from '/home/project/src/db/devicetype';
import { brandOptions } from '/home/project/src/db/brands';

// Utility: Slugify a given text (lowercase, replace non-alphanumeric with hyphens)
const slugify = (text: string): string => 
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const AdminModels: React.FC = () => {
  const [models, setModels] = useState<Model[]>(initialModels);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterDeviceType, setFilterDeviceType] = useState<string>('');
  const [filterBrand, setFilterBrand] = useState<string>('');
  const [sortField, setSortField] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  // Flag to track if the slug was manually modified.
  const [isSlugModified, setIsSlugModified] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    image: '',
    brand: '',
    deviceType: '',
    active: false,
    featured: false,
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterActive = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilterActive(value === 'all' ? null : value === 'active');
  };

  const handleFilterDeviceType = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterDeviceType(e.target.value);
  };

  const handleFilterBrand = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterBrand(e.target.value);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleOpenModal = (model: Model | null) => {
    setCurrentModel(model);
    setIsSlugModified(false); // Reset slug modification flag for new modal open.
    if (model) {
      setFormData({
        name: model.name,
        slug: model.slug,
        image: model.image,
        brand: model.brand,
        deviceType: model.deviceType,
        active: model.active,
        featured: model.featured,
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        image: '',
        brand: '',
        deviceType: '',
        active: false,
        featured: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentModel(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    // When the Name field changes, automatically update the slug if not manually modified.
    if (name === 'name') {
      setFormData((prev) => ({
        ...prev,
        name: value,
        slug: isSlugModified ? prev.slug : slugify(value),
      }));
    } else if (name === 'slug') {
      setFormData((prev) => ({ ...prev, slug: value }));
      setIsSlugModified(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === 'checkbox'
            ? (e.target as HTMLInputElement).checked
            : value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentModel) {
      // Update existing model
      const updatedModels = models.map((model) =>
        model.id === currentModel.id
          ? { ...model, ...formData, updatedAt: new Date().toISOString() }
          : model
      );
      setModels(updatedModels);
    } else {
      // Add new model
      const newModel: Model = {
        id: String(models.length + 1),
        ...formData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setModels([...models, newModel]);
    }
    handleCloseModal();
  };

  const handleDelete = (id: string) => {
    setModels(models.filter((model) => model.id !== id));
  };

  const filteredModels = models
    .filter((model) =>
      model.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((model) =>
      filterActive === null ? true : model.active === filterActive
    )
    .filter((model) =>
      filterDeviceType ? model.deviceType === filterDeviceType : true
    )
    .filter((model) => (filterBrand ? model.brand === filterBrand : true))
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'createdAt') {
        return sortDirection === 'asc'
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Models</h1>
        <button
          onClick={() => handleOpenModal(null)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="mr-2" /> Add Model
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearch}
              className="w-full px-4 py-2 border rounded-md"
              placeholder="Search models..."
            />
            <Search className="absolute right-3 top-3 text-gray-400" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Active
          </label>
          <select
            value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
            onChange={handleFilterActive}
            className="px-4 py-2 border rounded-md"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Device Type
          </label>
          <select
            value={filterDeviceType}
            onChange={handleFilterDeviceType}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All</option>
            {deviceTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Brand
          </label>
          <select
            value={filterBrand}
            onChange={handleFilterBrand}
            className="px-4 py-2 border rounded-md"
          >
            <option value="">All</option>
            {brandOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort('name')}
              >
                Name{' '}
                {sortField === 'name' &&
                  (sortDirection === 'asc' ? (
                    <ChevronUp className="inline" />
                  ) : (
                    <ChevronDown className="inline" />
                  ))}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Brand
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Device Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Active
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Featured
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer"
                onClick={() => handleSort('createdAt')}
              >
                Created At{' '}
                {sortField === 'createdAt' &&
                  (sortDirection === 'asc' ? (
                    <ChevronUp className="inline" />
                  ) : (
                    <ChevronDown className="inline" />
                  ))}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredModels.map((model) => (
              <tr key={model.id}>
                <td className="px-6 py-4">{model.name}</td>
                <td className="px-6 py-4">
                  <img
                    src={model.image}
                    alt={model.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                </td>
                <td className="px-6 py-4">{model.brand}</td>
                <td className="px-6 py-4">{model.deviceType}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      model.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {model.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-sm rounded-full ${
                      model.featured
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {model.featured ? 'Featured' : 'Not Featured'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {new Date(model.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleOpenModal(model)}
                    className="text-blue-500 hover:text-blue-700 mr-2"
                  >
                    <Edit />
                  </button>
                  <button
                    onClick={() => handleDelete(model.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-1/3">
            <h2 className="text-xl font-bold mb-4">
              {currentModel ? 'Edit Model' : 'Add Model'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Slug (auto-generated, editable)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Brand
                  </label>
                  <select
                    name="brand"
                    value={formData.brand}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select Brand</option>
                    {brandOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Device Type
                  </label>
                  <select
                    name="deviceType"
                    value={formData.deviceType}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border rounded-md"
                    required
                  >
                    <option value="">Select Device Type</option>
                    {deviceTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Active
                  </label>
                  <input
                    type="checkbox"
                    name="active"
                    checked={formData.active}
                    onChange={handleFormChange}
                    className="mt-2"
                  />
                </div>
                <div className="flex items-center">
                  <label className="block text-sm font-medium text-gray-700 mr-2">
                    Featured
                  </label>
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleFormChange}
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded-md"
                >
                  {currentModel ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminModels;
