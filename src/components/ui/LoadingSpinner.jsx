export const LoadingSpinner = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-2 border-wood/20 border-t-gold rounded-full animate-spin`}
      />
    </div>
  );
};

export const FullPageLoader = () => (
  <div className="min-h-screen bg-cream flex flex-col items-center justify-center">
    <div className="mb-6">
      <h2 className="font-heading text-2xl text-espresso">CVR Handicrafts</h2>
    </div>
    <LoadingSpinner size="lg" />
    <p className="mt-4 text-wood-light text-sm tracking-widest uppercase">Loading...</p>
  </div>
);
