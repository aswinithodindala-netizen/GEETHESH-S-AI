import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  color: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon: Icon, onClick, color }) => {
  return (
    <button 
      onClick={onClick}
      className="group relative flex flex-col items-start p-6 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl transition-all duration-300 text-left w-full h-full overflow-hidden"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      <div className={`p-3 rounded-lg bg-slate-900/50 mb-4 ${color.replace('from-', 'text-').split(' ')[0]}`}>
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </button>
  );
};

export default FeatureCard;