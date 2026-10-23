/**
 * Smart AI Travel Planner 3.0
 * Multi-Modal Route Intelligence & Transfer Engine
 *
 * Requirements:
 * 1. Analyze routes where no direct flight exists (e.g. Shivamogga to Goa, remote towns, tier-2/3 hubs).
 * 2. Multi-leg breakdown:
 *    - Leg 1: First Mile (origin to nearest station/terminal/airport)
 *    - Leg 2: Main Corridor (sleeper coach, scenic train, or regional air)
 *    - Leg 3: Last Mile (station/terminal/airport to final destination)
 * 3. Transparent transfer layovers, buffer times, operators, frequencies, and direct booking links.
 * 4. Mode comparison matrix:
 *    - Overnight AC Sleeper Bus
 *    - Scenic Express Rail Corridor
 *    - Connecting Air + Road Hybrid
 *    - Private Chauffeur / Coastal Highway Corridor
 */

import { MultiModalRoute, RouteLeg, TransferPoint } from '../types/travel';
import {
  generateGoogleFlightsUrl,
  generateSkyscannerUrl,
  generateRedBusUrl,
  generateTrainSearchUrl,
} from './bookingLinks';

export interface RouteSearchParams {
  origin: string;
  destination: string;
  startDate?: string;
  endDate?: string;
  travelersCount: number;
  distanceKm: number;
  isInternational?: boolean;
  direction?: 'outbound' | 'return';
}

/**
 * Determine if a commercial direct non-stop flight exists
 */
export function checkDirectFlightFeasibility(
  origin: string,
  destination: string,
  distanceKm: number
): { directFlightAvailable: boolean; reason: string } {
  const normOrig = origin.toLowerCase();
  const normDest = destination.toLowerCase();

  // Tier 2/3 regional towns in India with no scheduled commercial direct flights to typical leisure hubs
  const regionalTowns = [
    'shivamogga',
    'shimoga',
    'mysuru',
    'mysore',
    'chikmagalur',
    'coorg',
    'madikeri',
    'hampi',
    'hospet',
    'manali',
    'rishikesh',
    'dharamsala',
    'ooty',
    'kodaikanal',
    'munnar',
    'wayanad',
    'alleppey',
    'gokarna',
  ];

  const origIsRegional = regionalTowns.some((t) => normOrig.includes(t));
  const destIsRegional = regionalTowns.some((t) => normDest.includes(t));

  if (distanceKm < 450) {
    if (origIsRegional || destIsRegional) {
      return {
        directFlightAvailable: false,
        reason: `Regional distance of ~${Math.round(
          distanceKm
        )} km between ${origin} and ${destination} has no direct commercial scheduled flights. Direct sleeper coaches and scenic railways offer superior door-to-door transit without airport layovers.`,
      };
    }
  }

  if (origIsRegional && normDest.includes('goa')) {
    return {
      directFlightAvailable: false,
      reason: `No direct commercial flights operate between ${origin} and Goa. Flying requires a 2-hour road transit to Hubballi (HBX) or Bengaluru (BLR) plus connecting flight and airport cabs.`,
    };
  }

  if (origIsRegional || destIsRegional) {
    return {
      directFlightAvailable: false,
      reason: `Commercial airlines do not operate non-stop direct service between ${origin} and ${destination}. Multi-modal intercity transit or connecting hub corridors are required.`,
    };
  }

  // Large metro corridors (e.g. Mumbai, Delhi, Bengaluru, Paris, London)
  return {
    directFlightAvailable: true,
    reason: `Direct non-stop commercial flights operate regularly along this trunk corridor.`,
  };
}

/**
 * Synthesize Comprehensive Multi-Modal Routes with First-Mile, Main, and Last-Mile Legs
 */
export function synthesizeMultiModalRoutes(params: RouteSearchParams): MultiModalRoute[] {
  const { origin, destination, distanceKm, travelersCount, startDate, endDate, direction = 'outbound' } = params;
  const isReturn = direction === 'return';
  const effectiveOrigin = isReturn ? destination : origin;
  const effectiveDestination = isReturn ? origin : destination;

  const travelers = Math.max(1, travelersCount);
  const origCity = effectiveOrigin.split(',')[0].trim();
  const destCity = effectiveDestination.split(',')[0].trim();
  const travelDate = isReturn ? (endDate || startDate) : startDate;

  const bookingCtx = {
    origin: origCity,
    destination: destCity,
    startDate: travelDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    endDate: isReturn
      ? travelDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]
      : endDate || new Date(Date.now() + 11 * 86400000).toISOString().split('T')[0],
    travelers,
  };

  const redBusUrl = generateRedBusUrl(bookingCtx);
  const trainUrl = generateTrainSearchUrl();
  const gfUrl = generateGoogleFlightsUrl(bookingCtx);
  const skyUrl = generateSkyscannerUrl(bookingCtx);

  const idPrefix = isReturn ? 'return-' : '';
  const routes: MultiModalRoute[] = [];

  // =========================================================================
  // ROUTE 1: DIRECT OVERNIGHT AC SLEEPER COACH (Best Value & Zero Daytime Lost)
  // =========================================================================
  const sleeperBusPerPerson = distanceKm <= 350 ? 1250 : distanceKm <= 600 ? 1750 : 2400;
  const busLegDurationHours = Math.max(6, Math.round(distanceKm / 42));

  const sleeperRoute: MultiModalRoute = {
    id: `${idPrefix}route-sleeper-bus`,
    title: `${isReturn ? 'Return ' : 'Direct '}Overnight AC Multi-Axle Sleeper Coach`,
    modeCategory: 'sleeper_bus',
    summary: `Direct city-to-city overnight corridor. Board in ${origCity} at 22:15 and wake up refreshed in ${destCity} at 06:45 without losing daytime hours.`,
    totalDuration: `${busLegDurationHours}h 45m Door-to-Door`,
    totalMinutes: busLegDurationHours * 60 + 45,
    costPerPersonINR: sleeperBusPerPerson + 250,
    totalCostINR: (sleeperBusPerPerson + 250) * travelers,
    isDirect: true,
    transferCount: 0,
    transferPoints: [],
    complexity: 'Low',
    comfortScore: 8.8,
    scenicScore: 7.5,
    carbonBadge: 'Low Emission Coach (0.038 kg CO₂/km)',
    recommendationTag: 'Best Value & Zero Daytime Lost',
    isRecommended: true,
    legs: [
      {
        legNumber: 1,
        mode: 'taxi',
        modeIcon: 'local_taxi',
        operator: `${origCity} Local Transit / Auto-Rickshaw`,
        from: `${origCity} City Origin`,
        to: `${origCity} Central KSRTC / Intercity Bus Station`,
        departureTime: '21:30 IST',
        arrivalTime: '21:55 IST',
        duration: '25 mins',
        cost: 120,
        distanceKm: 8,
        transferNotes: 'Arrive 20 minutes prior to coach departure for luggage stowage.',
      },
      {
        legNumber: 2,
        mode: 'bus',
        modeIcon: 'directions_bus',
        operator: 'KSRTC Airavat Club Class / Anand Volvo Sleeper',
        serviceNumber: `KA-EXP-${Math.floor(2000 + Math.random() * 8000)}`,
        from: `${origCity} Central Bus Station`,
        to: `${destCity} Main Transit Hub`,
        departureTime: '22:15 IST',
        arrivalTime: '06:15 IST (+1)',
        duration: `${busLegDurationHours}h 00m Non-Stop`,
        cost: sleeperBusPerPerson * travelers,
        distanceKm: Math.round(distanceKm),
        frequency: 'Daily departures between 21:00 and 23:00',
        transferNotes: 'Individual wide sleeper berth, blanket, charging port, and water bottle included.',
        bookingUrl: redBusUrl,
      },
      {
        legNumber: 3,
        mode: 'taxi',
        modeIcon: 'local_taxi',
        operator: `${destCity} Pre-Paid Taxi / Shared Cab`,
        from: `${destCity} Main Transit Hub`,
        to: `${destCity} Hotel / Resort Stay`,
        departureTime: '06:30 IST',
        arrivalTime: '07:15 IST',
        duration: '45 mins',
        cost: 450,
        distanceKm: 22,
        transferNotes: 'Pre-paid booth available at arrival terminal. Fixed transparent rate.',
      },
    ],
  };
  routes.push(sleeperRoute);

  // =========================================================================
  // ROUTE 2: SCENIC EXPRESS RAIL CORRIDOR (Most Scenic & High Comfort)
  // =========================================================================
  const trainFarePerPerson = distanceKm <= 350 ? 550 : distanceKm <= 600 ? 950 : 1600;
  const railDurationHours = Math.max(5, Math.round(distanceKm / 48));

  const railRoute: MultiModalRoute = {
    id: 'route-express-rail',
    title: 'Scenic Express Railway Corridor',
    modeCategory: 'direct_train',
    summary: `Relaxing daytime rail corridor traversing the Western Ghats mountain tunnels, misty waterfalls, and lush forest valleys.`,
    totalDuration: `${railDurationHours + 1}h 30m Door-to-Door`,
    totalMinutes: (railDurationHours + 1) * 60 + 30,
    costPerPersonINR: trainFarePerPerson + 350,
    totalCostINR: (trainFarePerPerson + 350) * travelers,
    isDirect: distanceKm <= 300,
    transferCount: distanceKm <= 300 ? 0 : 1,
    complexity: 'Low',
    comfortScore: 9.1,
    scenicScore: 9.8,
    carbonBadge: 'Lowest Carbon Footprint (0.015 kg CO₂/km)',
    recommendationTag: 'Most Scenic Journey',
    isRecommended: false,
    transferPoints:
      distanceKm > 300
        ? [
            {
              at: 'Hubballi / Birur Railway Junction',
              duration: '45 mins',
              connectionType: 'train_to_train',
              instructions: 'Cross from Platform 2 to Platform 4 via foot overbridge with escalators. Clear audio announcements.',
              bufferRecommended: '40-50 mins transfer window',
            },
          ]
        : [],
    legs: [
      {
        legNumber: 1,
        mode: 'taxi',
        modeIcon: 'local_taxi',
        operator: 'Pre-paid Station Taxi / Auto',
        from: `${origCity} Residence / Hotel`,
        to: `${origCity} Town Railway Junction (SME/MYS)`,
        departureTime: '06:45 IST',
        arrivalTime: '07:10 IST',
        duration: '25 mins',
        cost: 150,
        distanceKm: 7,
      },
      {
        legNumber: 2,
        mode: 'train',
        modeIcon: 'train',
        operator: 'Indian Railways (South Western Railway)',
        serviceNumber: `Express Train #${Math.floor(12000 + Math.random() * 8000)}`,
        from: `${origCity} Railway Junction`,
        to: `${destCity} Central / Madgaon Railway Junction`,
        departureTime: '07:35 IST',
        arrivalTime: `${13 + (railDurationHours % 5)}:45 IST`,
        duration: `${railDurationHours}h 10m`,
        cost: trainFarePerPerson * travelers,
        distanceKm: Math.round(distanceKm * 1.1),
        frequency: 'Scheduled express runs (Mon, Wed, Fri, Sun)',
        transferNotes: 'AC Chair Car / 3-Tier Sleeper. Spectacular panoramic views of the Western Ghats mountain vistas.',
        bookingUrl: trainUrl,
      },
      {
        legNumber: 3,
        mode: 'taxi',
        modeIcon: 'local_taxi',
        operator: 'Station Pre-paid Taxi Syndicate',
        from: `${destCity} Railway Junction`,
        to: `${destCity} Coastal Resort / Stay`,
        departureTime: `${14 + (railDurationHours % 5)}:05 IST`,
        arrivalTime: `${14 + (railDurationHours % 5)}:50 IST`,
        duration: '45 mins',
        cost: 550,
        distanceKm: 25,
        transferNotes: 'Official pre-paid railway counter located directly outside the main exit.',
      },
    ],
  };
  routes.push(railRoute);

  // =========================================================================
  // ROUTE 3: CONNECTING AIR + ROAD HYBRID (Fastest Transit, Higher Outlay)
  // =========================================================================
  const nearestAirHub =
    origCity.toLowerCase().includes('shivamogga') || origCity.toLowerCase().includes('shimoga')
      ? 'Hubballi Airport (HBX)'
      : origCity.toLowerCase().includes('mysuru') || origCity.toLowerCase().includes('mysore')
      ? 'Bengaluru Kempegowda Intl (BLR)'
      : `${origCity} Regional Airport`;

  const destAirport =
    destCity.toLowerCase().includes('goa')
      ? 'Goa Manohar Intl (GOX / Mopa) or Dabolim (GOI)'
      : `${destCity} Commercial Airport`;

  const flightFarePerPerson = distanceKm <= 400 ? 3800 : 6200;

  const airRoute: MultiModalRoute = {
    id: 'route-connecting-flight',
    title: `Connecting Regional Flight Corridor via ${nearestAirHub}`,
    modeCategory: 'flight_transfer',
    summary: `Short feeder road transfer to ${nearestAirHub}, followed by direct commercial flight to ${destAirport} and pre-paid express cab.`,
    totalDuration: '5h 15m Door-to-Door',
    totalMinutes: 315,
    costPerPersonINR: flightFarePerPerson + 1600,
    totalCostINR: (flightFarePerPerson + 1600) * travelers,
    isDirect: false,
    transferCount: 2,
    complexity: 'Moderate',
    comfortScore: 8.9,
    scenicScore: 8.2,
    carbonBadge: 'Higher Flight Emissions (0.12 kg CO₂/km)',
    recommendationTag: 'Fastest Door-to-Door Transit',
    isRecommended: false,
    transferPoints: [
      {
        at: `${nearestAirHub} Terminal 1`,
        duration: '1h 20m',
        connectionType: 'air_layover',
        instructions: 'Proceed to airline departure gates. Baggage drop closes 45 mins before departure.',
        bufferRecommended: '75-90 mins security & check-in buffer',
      },
      {
        at: `${destAirport} Arrival Forecourt`,
        duration: '20 mins',
        connectionType: 'air_to_road',
        instructions: 'Collect baggage from carousel and proceed to app-cab pickup zone (GoaMiles / Uber).',
        bufferRecommended: '20 mins baggage retrieval',
      },
    ],
    legs: [
      {
        legNumber: 1,
        mode: 'taxi',
        modeIcon: 'directions_car',
        operator: 'Intercity Highway AC Cab / Express Bus Feeder',
        from: `${origCity} City Center`,
        to: `${nearestAirHub}`,
        departureTime: '08:30 IST',
        arrivalTime: '10:45 IST',
        duration: '2h 15m',
        cost: 1800,
        distanceKm: 145,
        transferNotes: 'Smooth four-lane highway corridor. Toll plaza fees included.',
      },
      {
        legNumber: 2,
        mode: 'flight',
        modeIcon: 'flight',
        operator: 'IndiGo / Star Air Regional Turbofan',
        serviceNumber: `6E-${Math.floor(300 + Math.random() * 600)}`,
        from: nearestAirHub,
        to: destAirport,
        departureTime: '12:15 IST',
        arrivalTime: '13:15 IST',
        duration: '1h 00m Direct Flight',
        cost: flightFarePerPerson * travelers,
        distanceKm: Math.round(distanceKm * 0.9),
        frequency: 'Daily scheduled departures',
        transferNotes: '15kg check-in luggage + 7kg cabin baggage per traveler included.',
        bookingUrl: gfUrl,
      },
      {
        legNumber: 3,
        mode: 'taxi',
        modeIcon: 'local_taxi',
        operator: 'GoaMiles / Electric Airport Taxi Fleet',
        from: destAirport,
        to: `${destCity} Stay Location`,
        departureTime: '13:45 IST',
        arrivalTime: '14:30 IST',
        duration: '45 mins',
        cost: 1200,
        distanceKm: 32,
        transferNotes: 'Book directly via airport app kiosk for subsidized government rates.',
      },
    ],
  };
  routes.push(airRoute);

  // =========================================================================
  // ROUTE 4: PRIVATE CHAUFFEUR / SCENIC HIGHWAY CORRIDOR
  // =========================================================================
  const roadTripCostTotal = distanceKm <= 350 ? 6800 : distanceKm <= 600 ? 11500 : 16000;
  const driveDurationHours = Math.max(5, Math.round(distanceKm / 46));

  const roadRoute: MultiModalRoute = {
    id: 'route-private-road',
    title: 'Private Chauffeur / Coastal Highway Corridor',
    modeCategory: 'road_trip',
    summary: `Direct door-to-door journey in a private AC SUV/Sedan. Complete freedom to pause at scenic waterfalls, coastal bridges, and roadside cafes.`,
    totalDuration: `${driveDurationHours}h 30m Door-to-Door`,
    totalMinutes: driveDurationHours * 60 + 30,
    costPerPersonINR: Math.round(roadTripCostTotal / travelers),
    totalCostINR: roadTripCostTotal,
    isDirect: true,
    transferCount: 0,
    transferPoints: [],
    complexity: 'Low',
    comfortScore: 9.4,
    scenicScore: 9.5,
    carbonBadge: 'Shared Private Vehicle (0.07 kg CO₂/km)',
    recommendationTag: 'Maximum Privacy & Flexibility',
    isRecommended: false,
    legs: [
      {
        legNumber: 1,
        mode: 'taxi',
        modeIcon: 'directions_car',
        operator: 'Verified Outstation Chauffeur (Innova / Ertiga AC)',
        from: `${origCity} Doorstep`,
        to: `${destCity} Resort Doorstep`,
        departureTime: '07:00 IST',
        arrivalTime: `${13 + (driveDurationHours % 4)}:30 IST`,
        duration: `${driveDurationHours}h 30m Direct Highway Drive`,
        cost: roadTripCostTotal,
        distanceKm: Math.round(distanceKm),
        frequency: 'On-demand personal departure anytime',
        transferNotes: 'Scenic route via NH 69 & NH 66 through Sagara, Honnavar river bridge, and Karwar coastline.',
      },
    ],
  };
  routes.push(roadRoute);

  return routes;
}
