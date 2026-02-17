import React from "react";

// Croissant icon (stylish curved design)
export const CroissantIcon = ({ className = "h-10 w-10", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M8 6C8 4.9 8.9 4 10 4c1.5 0 2.8 1.1 3.2 2.5.1.3.4.5.7.4.3-.1.5-.4.4-.7C13.7 4.5 12 3 10 3c-1.7 0-3 1.3-3 3v10c0 1.7 1.3 3 3 3h6c1.7 0 3-1.3 3-3V9c0-1.1-.9-2-2-2h-1c-.6 0-1 .4-1 1s.4 1 1 1h1v7c0 .6-.4 1-1 1H10c-.6 0-1-.4-1-1V6z"
      fill="currentColor"
      opacity="0.9"
    />
    <path
      d="M9 8c0-.6.4-1 1-1h4c.6 0 1 .4 1 1s-.4 1-1 1h-4c-.6 0-1-.4-1-1zm0 4c0-.6.4-1 1-1h4c.6 0 1 .4 1 1s-.4 1-1 1h-4c-.6 0-1-.4-1-1z"
      fill="currentColor"
      opacity="0.6"
    />
    <path
      d="M10 5c-1.1 0-2 .9-2 2v1c0 .6.4 1 1 1h6c.6 0 1-.4 1-1V7c0-1.1-.9-2-2-2h-4z"
      fill="currentColor"
      opacity="0.3"
    />
  </svg>
);

// Plate with food icon (stylish design)
export const PlateIcon = ({ className = "h-10 w-10", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle
      cx="12"
      cy="12"
      r="9"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="12" cy="12" r="6" fill="currentColor" opacity="0.15" />
    <path
      d="M7 9c1.5 1.5 3.5 2.5 5 2.5s3.5-1 5-2.5M7 15c1.5-1.5 3.5-2.5 5-2.5s3.5 1 5 2.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      opacity="0.5"
    />
    <circle cx="12" cy="12" r="2.5" fill="currentColor" opacity="0.4" />
    <path
      d="M12 3v2M12 19v2M3 12h2M19 12h2"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

// Breakfast icon (croissant) - alias for compatibility
export const BreakfastIcon = ({ className = "h-8 w-8", ...props }) => (
  <CroissantIcon className={className} {...props} />
);

// Lunch icon (plate with utensils) - alias for compatibility
export const LunchIcon = ({ className = "h-8 w-8", ...props }) => (
  <PlateIcon className={className} {...props} />
);

// Sunrise icon for breakfast
export const SunriseIcon = ({ className = "h-5 w-5", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="12"
      cy="12"
      r="4"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

// Sun icon for lunch
export const SunIcon = ({ className = "h-5 w-5", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <circle cx="12" cy="12" r="4" fill="currentColor" />
    <path
      d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

// Restaurant/Dining icon for navbar
export const RestaurantIcon = ({ className = "h-6 w-6", ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"
      fill="currentColor"
    />
  </svg>
);
