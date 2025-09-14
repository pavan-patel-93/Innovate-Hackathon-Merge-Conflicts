export default function LoadingSpinner({ size = "md", className, text = "Loading..." }) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6", 
    lg: "w-8 h-8"
  };

  // Helper function to combine classNames
  const cn = (...classes) => {
    return classes.filter(Boolean).join(' ');
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center",
      className
    )}>
      <div className="flex items-center space-x-2">
        <div 
          className={cn(
            "border-2 border-blue-600 border-t-transparent rounded-full animate-spin",
            sizeClasses[size]
          )}
          aria-hidden="true"
        />
        <span className="text-gray-600 dark:text-gray-400">{text}</span>
      </div>
    </div>
  );
}