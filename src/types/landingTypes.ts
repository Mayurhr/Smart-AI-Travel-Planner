/**
 * Smart AI Travel Planner 3.0
 * Landing Page Types — isolated from src/types/travel.ts to avoid naming collisions.
 * Ported from travel_around_world_extracted/src/types.ts
 */

export interface TravelPackage {
  id: string;
  title: string;
  location: string;
  country: string;
  duration: string;
  price: number;
  rating: number;
  image: string;
  description: string;
  highlights: string[];
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  period: string;
  isPopular?: boolean;
  features: string[];
}

export interface LandingSearchState {
  category: 'Flights' | 'Hotels' | 'Cars' | 'Experiences';
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  travelers: number;
  travelerType: string;
}

export interface BookingStep {
  stepNumber: number;
  title: string;
  description: string;
  iconType: 'destination' | 'package' | 'payment' | 'trip';
}
