import { useState, useEffect } from 'react'; // Added useEffect import
import { X } from 'lucide-react';

const AddProductModal = ({ isOpen, onClose, onRefresh, product }) => {
    const [formData, setFormData] = useState({
        name: '',
        stock_level: 0,
        category: 'General',
        price: 0,
        min_stock_threshold: 10,
        avg_daily_sales: 0
    });

    // Sync form data when the modal opens or the product prop changes
    useEffect(() => {
        if (isOpen) {
            if (product) {
                // Pre-fill fields for EDIT mode
                setFormData({
                    name: product.name || '',
                    stock_level: product.stock_level || 0,
                    category: product.category || 'General',
                    price: product.price || 0,
                    min_stock_threshold: product.min_stock_threshold || 10,
                    avg_daily_sales: product.avg_daily_sales || 0
                });
            } else {
                // Reset fields for ADD mode
                setFormData({
                    name: '',
                    stock_level: 0,
                    category: 'General',
                    price: 0,
                    min_stock_threshold: 10,
                    avg_daily_sales: 0
                });
            }
        }
    }, [product, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        // Decide URL and Method based on if we are editing or adding
        const url = product
            ? `http://localhost:8000/update-product/${product.id}`
            : 'http://localhost:8000/add-product';

        const method = product ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...formData,
                // Ensure numbers are sent as numbers, not strings
                stock_level: parseInt(formData.stock_level),
                price: parseFloat(formData.price),
                avg_daily_sales: parseFloat(formData.avg_daily_sales)
            }),
        });

        if (response.ok) {
            onRefresh();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[#1e293b] p-8 rounded-2xl border border-slate-700 w-full max-w-md shadow-2xl relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                    <X size={20} />
                </button>

                {/* DYNAMIC TITLE */}
                <h2 className="text-xl font-bold mb-6 text-white">
                    {product ? 'Edit Product' : 'Add New Product'}
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase">Product Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-slate-400 text-sm font-medium">CATEGORY</label>
                        <input
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. Electronics, Furniture, Groceries"
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* 2. Lead Time: New field for the AI logic */}
                        <div className="space-y-2">
                            <label className="text-slate-400 text-sm font-medium uppercase">Lead Time (Days)</label>
                            <input
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Time to restock"
                                onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-slate-400 text-sm font-medium uppercase">Price</label>
                            <input
                                type="number"
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Current Stock</label>
                            <input
                                type="number"
                                value={formData.stock_level}
                                onChange={(e) => setFormData({ ...formData, stock_level: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase">Price</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 block">
                            Avg. Daily Sales (Velocity)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={formData.avg_daily_sales}
                            onChange={(e) => setFormData({ ...formData, avg_daily_sales: e.target.value })}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none"
                        />
                    </div>
                </div>

                <div className="flex gap-4 mt-8">
                    <button onClick={onClose} className="flex-1 p-2 text-slate-400 hover:text-white transition">Cancel</button>
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 p-2 rounded-lg text-white font-bold shadow-lg transition"
                    >
                        {product ? 'Save Changes' : 'Add Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddProductModal;