import React, { useState } from 'react';

export default function Avatar({
  src,
  name = 'Explorer',
  size = 'md',
  className = '',
  ringColor = null
}) {
  const [imageError, setImageError] = useState(!src);

  // Size mapping
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl'
  };

  const initial = (name || 'E').trim().charAt(0).toUpperCase();

  // Deterministic vibrant gradient based on name
  const getGradient = (str) => {
    const gradients = [
      'from-cyan-500 via-blue-600 to-indigo-700',
      'from-purple-500 via-violet-600 to-pink-600',
      'from-emerald-500 via-teal-600 to-cyan-700',
      'from-amber-500 via-orange-600 to-red-600',
      'from-pink-500 via-rose-600 to-purple-700'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  const bgGrad = getGradient(name);

  return (
    <div
      className={`relative inline-flex items-center justify-center flex-shrink-0 rounded-2xl overflow-hidden font-orbitron font-extrabold select-none transition-all shadow-md ${
        sizeClasses[size] || sizeClasses.md
      } ${ringColor ? `ring-2 ${ringColor}` : 'border border-white/20'} ${className}`}
    >
      {!imageError && src ? (
        <img
          src={src}
          alt={name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover bg-[#090b1c]"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className={`w-full h-full bg-gradient-to-tr ${bgGrad} flex items-center justify-center text-white shadow-inner`}>
          <span className="drop-shadow-sm">{initial}</span>
        </div>
      )}
    </div>
  );
}
