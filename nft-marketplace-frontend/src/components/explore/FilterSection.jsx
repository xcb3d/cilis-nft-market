import { useState } from 'react';
import Button from '../common/Button';

const FilterSection = ({ onFilterChange }) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [sortBy, setSortBy] = useState('recent');

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'art', name: 'Art' },
    { id: 'collectibles', name: 'Collectibles' },
    { id: 'music', name: 'Music' },
    { id: 'photography', name: 'Photography' },
    { id: 'sports', name: 'Sports' },
  ];

  const sortOptions = [
    { id: 'recent', name: 'Recently Listed' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'most-liked', name: 'Most Liked' },
  ];

  return (
    <div className="glass-panel p-6 space-y-6">
      {/* Categories */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-4 py-2 rounded-xl transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white'
                  : 'bg-glass-white hover:bg-white/20 text-gray-300'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Price Range</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="number"
              placeholder="Min"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
              className="input w-full"
            />
            <span className="text-gray-400">to</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="input w-full"
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="w-full accent-neon-purple"
          />
        </div>
      </div>

      {/* Sort By */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="input w-full"
        >
          {sortOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      {/* Apply Filters Button */}
      <Button
        variant="primary"
        className="w-full"
        onClick={() => onFilterChange({ activeCategory, priceRange, sortBy })}
      >
        Apply Filters
      </Button>
    </div>
  );
};

export default FilterSection; 