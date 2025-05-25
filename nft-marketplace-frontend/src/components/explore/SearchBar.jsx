const SearchBar = ({ onSearch }) => {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search NFTs, collections, or creators..."
        onChange={(e) => onSearch(e.target.value)}
        className="input pl-12 w-full"
      />
      <svg
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
};

export default SearchBar; 