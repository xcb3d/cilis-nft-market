const ActiveButton = ({ 
    children, 
    isActive, 
    onClick, 
    className = '',
    activeClassName = 'bg-gradient-to-r from-cyan-400 to-cyan-600 text-white',
    inactiveClassName = 'text-gray-400 hover:text-white'
  }) => {
    const baseStyles = 'px-6 py-2 rounded-lg transition-all duration-300';
    
    return (
      <button
        onClick={onClick}
        className={`${baseStyles} ${
          isActive ? activeClassName : inactiveClassName
        } ${className}`}
      >
        {children}
      </button>
    );
  };
  
  export default ActiveButton;