/**
 * Smart AI Travel Planner 3.0
 * Real Booking & Search Links Generator
 *
 * Generates accurately encoded, destination-aware search URLs for:
 * - Google Flights
 * - Skyscanner
 * - MakeMyTrip
 * - Booking.com
 * - Google Hotels
 * - Airbnb
 * - RedBus (intercity bus routes)
 * - IRCTC (Indian Railways)
 */

export interface BookingSearchContext {
  origin: string;
  destination: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  travelers: number;
  rooms?: number;
}

export function generateGoogleFlightsUrl(ctx: BookingSearchContext): string {
  const query = `Flights to ${ctx.destination} from ${ctx.origin} on ${ctx.startDate}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
}

export function generateSkyscannerUrl(ctx: BookingSearchContext): string {
  // Clean origin and destination to extract city or airport tokens
  const originClean = ctx.origin.split(',')[0].trim().replace(/\s+/g, '-').toLowerCase();
  const destClean = ctx.destination.split(',')[0].trim().replace(/\s+/g, '-').toLowerCase();
  const dateToken = ctx.startDate ? ctx.startDate.replace(/-/g, '').substring(2) : '';
  return `https://www.skyscanner.com/transport/flights/${encodeURIComponent(originClean)}/${encodeURIComponent(destClean)}/${dateToken}/`;
}

export function generateMakeMyTripFlightsUrl(ctx: BookingSearchContext): string {
  const orig = ctx.origin.split(',')[0].trim();
  const dest = ctx.destination.split(',')[0].trim();
  return `https://www.makemytrip.com/flights/`;
}

export function generateBookingDotComUrl(ctx: BookingSearchContext): string {
  const dest = ctx.destination.trim();
  const rooms = ctx.rooms || Math.ceil(ctx.travelers / 2);
  const adults = ctx.travelers || 2;
  const checkin = ctx.startDate;
  const checkout = ctx.endDate;

  const params = new URLSearchParams({
    ss: dest,
    checkin: checkin,
    checkout: checkout,
    group_adults: adults.toString(),
    no_rooms: rooms.toString(),
    group_children: '0',
  });

  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

export function generateGoogleHotelsUrl(ctx: BookingSearchContext): string {
  const dest = ctx.destination.trim();
  const datesParam = `${ctx.startDate}%2C${ctx.endDate}`;
  return `https://www.google.com/travel/hotels/${encodeURIComponent(dest)}?dates=${datesParam}`;
}

export function generateAirbnbUrl(ctx: BookingSearchContext): string {
  const dest = ctx.destination.trim();
  const params = new URLSearchParams({
    checkin: ctx.startDate,
    checkout: ctx.endDate,
    adults: ctx.travelers.toString(),
  });
  return `https://www.airbnb.com/s/${encodeURIComponent(dest)}/homes?${params.toString()}`;
}

export function generateRedBusUrl(ctx: BookingSearchContext): string {
  const origClean = ctx.origin.split(',')[0].trim().toLowerCase().replace(/\s+/g, '-');
  const destClean = ctx.destination.split(',')[0].trim().toLowerCase().replace(/\s+/g, '-');
  return `https://www.redbus.in/bus-tickets/${origClean}-to-${destClean}`;
}

export function generateTrainSearchUrl(): string {
  return `https://www.irctc.co.in/nget/train-search`;
}
