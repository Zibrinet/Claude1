export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-2',
  }[size]

  return (
    <div
      className={`${sizeClass} animate-spin rounded-full border-gray-600 border-t-indigo-400`}
      role="status"
      aria-label="Loading"
    />
  )
}
