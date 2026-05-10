// Helper functions for dashboard components
export const getActivityIcon = (type) => {
  const { Sparkles, Users, Briefcase, Calendar, TrendingUp } = require('lucide-react');
  
  switch (type) {
    case 'match': return Sparkles;
    case 'connection': return Users;
    case 'job': return Briefcase;
    case 'event': return Calendar;
    default: return TrendingUp;
  }
};

export const getSemanticIcon = (type) => {
  const { Rocket, Brain, Network, Target } = require('lucide-react');
  
  switch (type) {
    case 'career_trajectory': return Rocket;
    case 'skill_gap': return Brain;
    case 'network_opportunity': return Network;
    default: return Target;
  }
};