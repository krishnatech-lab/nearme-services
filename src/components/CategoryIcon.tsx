import React from 'react';
import {
  Wrench,
  Tv,
  Car,
  HardHat,
  Sparkles,
  Briefcase,
  PartyPopper,
  Zap,
  Droplet,
  Hammer,
  Paintbrush,
  Shield,
  Truck,
  Camera,
  Layers,
  LucideProps,
} from 'lucide-react';

interface CategoryIconProps extends LucideProps {
  name: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, ...props }) => {
  const iconMap: Record<string, React.ElementType> = {
    Wrench,
    Tv,
    Car,
    HardHat,
    Sparkles,
    Briefcase,
    PartyPopper,
    Zap,
    Droplet,
    Hammer,
    Paintbrush,
    Shield,
    Truck,
    Camera,
    Layers,
  };

  const IconComponent = iconMap[name] || Wrench;
  return <IconComponent {...props} />;
};
