import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { variantModelPrices } from '../../db/valuation';
import { useModels } from '../../contexts/ModelsContext';
import { Model } from '../../db/models';

interface PricingEntry {
  id: string;
  modelSlug: string;
  variant: string;
  price: number;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

const AdminPricing: React.FC = () => {
  const { models } = useModels();

  // Base DB prices
  const [pricingList, setPricingList] = useState<PricingEntry[]>(() =>
    Object.entries(variantModelPrices).flatMap(([modelSlug, variants]) =>
      Object.entries(variants).map(([variant, price]) => ({
        id: `${modelSlug}|||${variant}`,
        modelSlug,
        variant,
        price,
      }))
    )
  );

  // Search filter for table
  const [searchTerm, setSearchTerm] = useState('');
  const filteredList = pricingList.filter((e) => {
    const modelName = models.find((m) => m.slug === e.modelSlug)?.name || '';
    return modelName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Filter by variant, price range, and model
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedVariant, setSelectedVariant] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');

  const filterList = filteredList.filter((e) => {
    const matchesModel = selectedModel ? e.modelSlug === selectedModel : true;
    const matchesVariant = selectedVariant ? e.variant === selectedVariant : true;
    const matchesMinPrice = minPrice !== '' ? e.price >= minPrice : true;
    const matchesMaxPrice = maxPrice !== '' ? e.price <= maxPrice : true;
    return matchesModel && matchesVariant && matchesMinPrice && matchesMaxPrice;
  });

  // Models without pricing
  const modelsWithoutPricing = models.filter((m) =>
    !pricingList.some((entry) => entry.modelSlug === m.slug)
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<PricingEntry>>({
    modelSlug: '',
    variant: '',
    price: 0,
  });

  // Modal state for Models Without Pricing
  const [isModelsWithoutPricingOpen, setIsModelsWithoutPricingOpen] = useState(false);

  // Modal search for models
  const [modalSearch, setModalSearch] = useState('');
  const [modalSuggestions, setModalSuggestions] = useState<Model[]>([]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Get available variants for selected model
  const availableVariants = formData.modelSlug 
    ? Object.keys(variantModelPrices[formData.modelSlug] || {})
    : [];

  useEffect(() => {
    if (modalSearch) {
      setModalSuggestions(
        models.filter((m) =>
          m.name.toLowerCase().includes(modalSearch.toLowerCase())
        )
      );
    } else {
      setModalSuggestions([]);
    }
  }, [modalSearch, models]);

  // Close modal suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setModalSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const openModal = (entryId: string | null = null) => {
    if (entryId) {
      const entry = pricingList.find((e) => e.id === entryId)!;
      setFormData({ ...entry });
      setModalSearch(models.find((m) => m.slug === entry.modelSlug)?.name || '');
      setEditingId(entryId);
    } else {
      setFormData({ modelSlug: '', variant: '', price: 0 });
      setModalSearch('');
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.modelSlug || !formData.variant) return;
    
    // Validate variant exists
    if (!variantModelPrices[formData.modelSlug]?.[formData.variant]) {
      alert('Selected variant is not valid for this model!');
      return;
    }

    const entry: PricingEntry = {
      id: editingId || `${formData.modelSlug}|||${formData.variant}`,
      modelSlug: formData.modelSlug,
      variant: formData.variant,
      price: formData.price || 0,
    };

    setPricingList((prev) => {
      const exists = prev.some((e) => e.id === entry.id);
      return exists ? prev.map((e) => (e.id === entry.id ? entry : e)) : [...prev, entry];
    });
    closeModal();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      setPricingList((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const openModelsWithoutPricingModal = () => setIsModelsWithoutPricingOpen(true);
  const closeModelsWithoutPricingModal = () => setIsModelsWithoutPricingOpen(false);

  return (
    <div className="px-4 py-8 space-y-8 max-w-7xl mx-auto">
      {/* Search & Add Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full sm:max-w-xs px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder="Search models..."
        />
        <button
          onClick={() => openModal(null)}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Add Pricing
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        >
          <option value="">All Models</option>
          {models.map((model) => (
            <option key={model.slug} value={model.slug}>
              {model.name}
            </option>
          ))}
        </select>

        <select
          value={selectedVariant}
          onChange={(e) => setSelectedVariant(e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          disabled={!selectedModel}
        >
          <option value="">All Variants</option>
          {selectedModel && 
            Object.keys(variantModelPrices[selectedModel] || {}).map((variant) => (
              <option key={variant} value={variant}>
                {variant}
              </option>
            ))
          }
        </select>

        <input
          type="number"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value ? parseInt(e.target.value) : '')}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />

        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value ? parseInt(e.target.value) : '')}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
      </div>

      {/* Models Without Pricing Section */}
      {modelsWithoutPricing.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={openModelsWithoutPricingModal}
            className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
          >
            Show Models Without Pricing ({modelsWithoutPricing.length})
          </button>
        </div>
      )}

      {/* Main Pricing Table */}
      <div className="overflow-x-auto rounded-lg border shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Model</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Variant</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Price</th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filterList.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {models.find((m) => m.slug === e.modelSlug)?.name || e.modelSlug}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{e.variant}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                  {formatCurrency(e.price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                  <button
                    onClick={() => openModal(e.id)}
                    className="text-gray-500 hover:text-blue-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="text-gray-500 hover:text-red-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Models Without Pricing Modal */}
      {isModelsWithoutPricingOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] flex flex-col shadow-xl">
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">Models Without Pricing</h3>
              <button
                onClick={closeModelsWithoutPricingModal}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Model Name</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {modelsWithoutPricing.map((model) => (
                    <tr key={model.slug} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {model.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setFormData({ 
                              modelSlug: model.slug, 
                              variant: '',
                              price: 0 
                            });
                            setIsModalOpen(true);
                            closeModelsWithoutPricingModal();
                          }}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm"
                        >
                          Add Pricing
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t flex justify-end">
              <button
                onClick={closeModelsWithoutPricingModal}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Pricing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md shadow-xl" ref={modalRef}>
            <div className="p-6 border-b flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {editingId ? 'Edit Pricing' : 'Add Pricing'}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Model</label>
                <div className="relative">
                  <input
                    type="text"
                    value={modalSearch}
                    onChange={(e) => {
                      setModalSearch(e.target.value);
                      setFormData(prev => ({ ...prev, variant: '' }));
                    }}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="Search model..."
                  />
                  {modalSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                      {modalSuggestions.map((m) => (
                        <li
                          key={m.slug}
                          onClick={() => {
                            setFormData({
                              modelSlug: m.slug,
                              variant: '',
                              price: 0
                            });
                            setModalSearch(m.name);
                            setModalSuggestions([]);
                          }}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-sm transition-colors"
                        >
                          {m.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Variant</label>
                <select
                  value={formData.variant}
                  onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  disabled={!formData.modelSlug}
                >
                  <option value="">Select Variant</option>
                  {formData.modelSlug && 
                    Object.keys(variantModelPrices[formData.modelSlug] || {}).map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))
                  }
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Price (INR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    price: parseFloat(e.target.value) || 0 
                  })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Enter price"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  {editingId ? 'Save Changes' : 'Add Pricing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPricing;