"use client";

import { LucideProps } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import dynamic from "next/dynamic";
import { Suspense } from "react";

interface DynamicIconProps extends LucideProps {
  name: string;
}

const FallbackIcon = () => <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />;

export const DynamicIcon = ({ name, ...props }: DynamicIconProps) => {
  // Convert name to kebab-case as lucide-react/dynamicIconImports uses kebab-case keys
  // e.g. "Smile" -> "smile", "MessageCircle" -> "message-circle" 
  // However, the user might input "Smile" or "smile". 
  // We need to robustly handle this.
  
  const kebabName = name
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .trim() as keyof typeof dynamicIconImports;

  const IconComponent = dynamicIconImports[kebabName] 
    ? dynamic(dynamicIconImports[kebabName]) 
    : null;

  if (!IconComponent) {
    return null; // or a default icon
  }

  return (
    <Suspense fallback={<FallbackIcon />}>
      <IconComponent {...props} />
    </Suspense>
  );
};
