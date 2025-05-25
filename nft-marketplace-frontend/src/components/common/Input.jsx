const Input = ({ label, className = '', ...props }) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          className={`
            w-full px-4 py-3 bg-glass-card backdrop-blur-xl
            border border-white/10 rounded-xl text-white
            placeholder-gray-400 shadow-glass
            focus:outline-none focus:ring-2 focus:ring-neon-purple/50
            focus:border-neon-purple/50 transition-all duration-300
            hover:bg-glass-white hover:shadow-lg hover:shadow-white/20
            ${className}
          `}
          {...props}
        />
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-neon-purple via-neon-blue to-neon-pink opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
      </div>
    </div>
  );
};

export default Input; 