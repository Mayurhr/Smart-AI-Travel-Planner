/**
 * Smart AI Travel Planner 3.0
 * Comprehensive Type System
 */

export type CurrencyCode =
  | 'INR'
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'AUD'
  | 'CAD'
  | 'SGD'
  | 'AED';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToINR: number; // 1 unit of foreign currency = X INR
}

export type TravelStyle =
  | 'luxury'
  | 'balanced'
  | 'budget'
  | 'adventure'
  | 'family'
  | 'relaxed';

export type ActivityCategory =
  | 'maritime'
  | 'aviation'
  | 'gastronomy'
  | 'culture'
  | 'wellness'
  | 'nature'
  | 'adventure'
  | 'transit';

export interface Activity {
  id: string;
  placeName?: string;
  destination?: string;
  dayNumber?: number;
  dateStr?: string;
  startTime?: string;
  endTime?: string;
  coordinates?: { lat: number; lon: number };
  currency?: CurrencyCode;
  dataSource?: string;
  isVerified?: boolean;
  placeId?: string;
  neighborhood?: string;
  timeSlot: string; // e.g., 'Morning · 09:00 - 12:30'
  title: string;
  category: ActivityCategory;
  categoryLabel: string;
  description: string;
  duration: string;
  estimatedCost: number; // in INR
  image: string;
  badge?: string;
  specs?: string[];
  alternatives?: {
    id: string;
    label: string;
    description: string;
    costDelta: number; // e.g. -15000 or +20000
  }[];
  transitAfter?: {
    type: 'tender' | 'heli' | 'car' | 'checkin' | 'walk';
    title: string;
    description: string;
    buffer: string;
  };
}

export interface DayItinerary {
  dayNumber: number;
  dateStr: string;
  title: string;
  tagline: string;
  activities: Activity[];
  weather: {
    tempC: number;
    condition: string;
    rainProb: string;
    wind: string;
  };
  totalEstimatedCost: number;
}

export type CabinClass = 'economy' | 'premium_economy' | 'business' | 'first';

export interface FlightFareBreakdown {
  baseFare: number; // in INR
  taxesAndFees: number; // in INR
  airportCharges: number; // in INR
  carrierFees: number; // in INR
  baggageCharges: number; // in INR
  optionalAddOns: number; // in INR
  totalPrice: number; // in INR
  pricePerPerson: number; // in INR
  passengerCount: number;
  currency: CurrencyCode;
  breakdownSuppliedByProvider: boolean;
  priceType: 'realtime_quote' | 'scheduled_tariff' | 'partner_rate';
  lastUpdated: string;
}

export interface FlightOption {
  id: string;
  operator: string;
  airlineName?: string;
  airlineCode?: string;
  airlineLogo?: string;
  flightNumber?: string;
  tailNumber: string;
  aircraftModel: string;
  type: 'private' | 'commercial';
  departureTime: string;
  departureDate?: string;
  originIata: string;
  originName: string;
  originDetail: string;
  arrivalTime: string;
  arrivalDate?: string;
  destinationIata: string;
  destinationName: string;
  destinationDetail: string;
  duration: string;
  durationMinutes?: number;
  stopsCount?: number; // 0 = direct, 1 = 1 stop, 2 = 2 stops
  layovers?: {
    airportIata: string;
    airportName: string;
    duration: string;
    terminalChange?: boolean;
  }[];
  cabinClass?: CabinClass;
  baggageAllowance?: {
    cabin: string;
    checkIn: string;
  };
  fareConditions?: {
    cancellationPolicy: string;
    isRefundable: boolean;
    changePolicy: string;
    seatSelectionIncluded: boolean;
    mealIncluded: boolean;
  };
  providerName?: string;
  lastUpdated?: string;
  serenityScore: number;
  isConfirmed?: boolean;
  price: number; // in INR
  priceLabel: string;
  baseFare?: number;
  taxesAndFees?: number;
  airportCharges?: number;
  carrierFees?: number;
  baggageFee?: number;
  seatSelection?: number;
  pricePerPerson?: number;
  totalPrice?: number;
  fareBreakdown?: FlightFareBreakdown;
  bookingNotes?: string;
  image: string;
  amenities: {
    icon: string;
    title: string;
    desc: string;
  }[];
  carbonBadge?: string;
  bookingUrl?: string;
  journeyDirection?: 'outbound' | 'return';
  isDemoData?: boolean;
}

export type TripType = 'one_way' | 'round_trip';

export interface TransportLegPlan {
  direction: 'outbound' | 'return';
  origin: string;
  destination: string;
  travelDate: string;
  availableOptions: FlightOption[];
  selectedOptionId?: string;
  selectedOption?: FlightOption;
  bookingUrl?: string;
}

export interface RouteLeg {
  legNumber: number;
  mode: 'flight' | 'train' | 'bus' | 'taxi' | 'ferry' | 'walk';
  modeIcon: string;
  operator: string;
  serviceNumber?: string;
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cost: number; // in INR
  frequency?: string;
  transferNotes?: string;
  bookingUrl?: string;
  distanceKm?: number;
}

export interface TransferPoint {
  at: string;
  duration: string;
  connectionType: 'train_to_train' | 'air_to_road' | 'road_to_rail' | 'air_layover' | 'bus_transfer';
  instructions: string;
  bufferRecommended: string;
}

export interface MultiModalRoute {
  id: string;
  title: string;
  modeCategory: 'direct_train' | 'sleeper_bus' | 'flight_transfer' | 'road_trip' | 'ferry';
  summary: string;
  totalDuration: string;
  totalMinutes: number;
  totalCostINR: number;
  costPerPersonINR: number;
  isDirect: boolean;
  transferCount: number;
  transferPoints: TransferPoint[];
  legs: RouteLeg[];
  complexity: 'Low' | 'Moderate' | 'High';
  comfortScore: number; // 1-10
  scenicScore: number; // 1-10
  carbonBadge: string;
  recommendationTag?: string; // 'Best Value', 'Fastest Door-to-Door', 'Most Scenic', 'Zero Daytime Lost'
  isRecommended?: boolean;
}

export interface RotaryTransfer {
  id: string;
  aircraft: string;
  origin: string;
  destination: string;
  duration: string;
  luggageOption: string;
  image: string;
  includedInTier: boolean;
  priceSupplement: number;
}

export interface SanctuaryStay {
  id: string;
  name: string;
  location: string;
  subLocation: string;
  keys: number; // Michelin keys or stars
  tagline: string;
  stateroomName: string;
  stateroomDesc: string;
  pricePerNight: number; // in INR
  totalNights: number;
  rating: number;
  acousticIsolationScore: string;
  image: string;
  isPrimaryAnchor: boolean;
  confNumber?: string;
  highlights: string[];
  inclusions: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  bookingUrl?: string;
}

export interface ExpenseItem {
  id: string;
  entityName: string;
  subDetail: string;
  dateRange: string;
  category: 'accommodations' | 'transit' | 'gastronomy' | 'experiences' | 'miscellaneous';
  paymentMethod: string;
  status: 'settled' | 'authorized' | 'escrow' | 'pending';
  amount: number; // in INR
  amountOriginal?: string;
}

export interface BudgetPlan {
  totalCap: number; // in INR
  maxBudget?: number; // alias for totalCap
  committedOutlay: number; // in INR
  contingencyReserve: number; // in INR
  fxHedgedValue: number; // in INR
  currency: CurrencyCode;
  items: ExpenseItem[];
  bilateralSplit: {
    person1: { name: string; sharePercent: number; amount: number; paymentDetails: string };
    person2: { name: string; sharePercent: number; amount: number; paymentDetails: string };
  };
  optimizationAlerts: {
    id: string;
    type: 'saving' | 'rebate' | 'arbitrage';
    title: string;
    savingsAmount: number;
    description: string;
    applied: boolean;
  }[];
}

export interface WeatherTelemetry {
  location: string;
  tempC: number;
  condition: string;
  seaTempC?: number;
  swellMeters?: number;
  windSpeedKts: number;
  windDirection: string;
  uvIndex: number;
  goldenHour: string;
  visibilityKm: number;
  packingChecklist: {
    category: string;
    items: string[];
  }[];
  advisoryLevel: 'safe' | 'caution' | 'warning';
  advisoryText: string;
}

export interface AgentStatus {
  id: string;
  code: string;
  name: string;
  role: string;
  progressPercent: number;
  status: 'completed' | 'running' | 'awaiting_input' | 'idle';
  statusLabel: string;
  recentActivity: string;
  verifiedTime: string;
  details: string[];
  icon: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'alert';
}

export interface ExtractedDocument {
  id: string;
  fileName: string;
  fileSize?: string;
  fileType?: string;
  uploadedAt?: string;
  parsedAt?: string;
  confidenceScore?: number;
  documentType: 'flight_ticket' | 'flight_confirmation' | 'hotel_voucher' | 'passport' | 'visa' | 'charter_agreement' | 'itinerary' | string;
  fields?: {
    passengerNames?: string[];
    bookingReference?: string;
    origin?: string;
    destination?: string;
    departureDate?: string;
    arrivalDate?: string;
    flightOrRoomNumber?: string;
    seatNumber?: string;
    terminalOrGate?: string;
    baggageAllowance?: string;
    pricePaid?: string;
    cancellationPolicy?: string;
    [key: string]: any;
  };
  extractedData?: {
    bookingRef?: string;
    travelerName?: string;
    carrierOrProperty?: string;
    origin?: string;
    destination?: string;
    dates?: string;
    seatOrRoom?: string;
    totalAmount?: string;
    confidenceScore?: number;
  };
  rawSummary?: string;
  status: 'verified' | 'needs_review' | 'failed';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
  agentMeta?: {
    agentName: string;
    confidence: number;
  };
}

export interface TripPlan {
  id: string;
  title: string;
  confNumber: string;
  tripType?: TripType; // 'round_trip' | 'one_way' (defaults to 'round_trip')
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelersCount: number;
  travelerDescription: string;
  style: TravelStyle;
  cabinClass?: CabinClass;
  pacing: {
    relaxedPercent: number;
    activePercent: number;
  };
  budget: BudgetPlan;
  itinerary: DayItinerary[];
  flights: FlightOption[]; // Outbound flight options (maintained for compatibility)
  outboundJourney?: TransportLegPlan;
  returnJourney?: TransportLegPlan;
  selectedOutboundFlightId?: string;
  selectedOutboundFlight?: FlightOption;
  selectedReturnFlightId?: string;
  selectedReturnFlight?: FlightOption;
  multiModalRoutes?: MultiModalRoute[];
  returnMultiModalRoutes?: MultiModalRoute[];
  selectedRouteId?: string;
  selectedRoute?: MultiModalRoute;
  selectedReturnRouteId?: string;
  selectedReturnRoute?: MultiModalRoute;
  selectedFlightId?: string;
  selectedFlight?: FlightOption;
  rotaryTransfer?: RotaryTransfer;
  sanctuaries: SanctuaryStay[];
  weather: WeatherTelemetry;
  agents: AgentStatus[];
  documents: ExtractedDocument[];
  extractedDocuments?: ExtractedDocument[];
  coverImage?: string;
  waypoints: {
    name: string;
    lat: number;
    lon: number;
    dayNum: string;
    color: string;
  }[];
  createdAt: string;
  updatedAt: string;
}
