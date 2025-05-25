const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyles = `
    relative inline-flex items-center justify-center px-6 py-3 
    rounded-xl font-medium transition-all duration-300 ease-out 
    hover:scale-105 active:scale-95
  `;
  
  const variants = {
    primary: `
      bg-gradient-to-r from-cyan-400 via-cyan-500 to-cyan-600
      text-white hover:shadow-lg hover:shadow-cyan-400/50
      before:absolute before:inset-0 before:rounded-xl
      before:bg-gradient-to-r before:from-cyan-500 before:via-cyan-600 before:to-cyan-400
      before:opacity-0 before:transition-opacity hover:before:opacity-100
      [&>span]:relative
    `,
    secondary: `
      bg-glass-white backdrop-blur-md border border-cyan-200/10 
      text-white hover:bg-cyan-50/20 hover:border-cyan-200/20
      hover:shadow-lg hover:shadow-cyan-100/10
    `,
    outline: `
      border-2 border-cyan-400 text-cyan-400 
      hover:bg-cyan-400/10 hover:shadow-cyan-400/30
      hover:shadow-lg
    `,
    glass: `
      bg-glass-card backdrop-blur-xl border border-cyan-200/10
      text-white shadow-glass hover:bg-glass-white
      hover:shadow-lg hover:shadow-cyan-200/20
    `,
    pastel: `
      bg-gradient-to-r from-cyan-200 via-cyan-300 to-cyan-400 
      text-dark-100 hover:shadow-lg hover:shadow-cyan-300/50
      before:absolute before:inset-0 before:rounded-xl
      before:bg-gradient-to-r before:from-cyan-300 before:via-cyan-400 before:to-cyan-200
      before:opacity-0 before:transition-opacity hover:before:opacity-100
      [&>span]:relative
    `,
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default Button; 