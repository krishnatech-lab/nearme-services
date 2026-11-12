export type WorkerAvailabilityStatus = 'available_now' | 'on_job' | 'offline';

export interface SpecialOffer {
  id: string;
  workerId: string;
  title: string;
  discountType: 'percentage' | 'flat' | 'free_addon';
  discountValue: string;
  couponCode: string;
  description: string;
  locality?: string;
  validUntil: string;
  minOrderAmount?: number;
  terms?: string;
  createdAt: string;
  isActive: boolean;
}

export interface WorkerProfile {
  id: string;
  name: string;
  businessName: string;
  phone: string;
  whatsapp?: string;
  category: string;
  subcategory: string;
  profileImage: string;
  bio: string;
  experienceYears: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  isAvailable: boolean;
  availabilityStatus: WorkerAvailabilityStatus;
  isFeatured: boolean;
  status: 'active' | 'pending' | 'rejected';
  workingHours: string;
  pricing: string;
  address: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  distanceKm?: number;
  services: string[];
  languages: string[];
  specialOffers?: SpecialOffer[];
  createdAt: string;
  viewsCount: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  subcategories: string[];
  workerCount?: number;
}

export interface Review {
  id: string;
  workerId: string;
  userName: string;
  userPhone: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ServiceRequestQuote {
  id: string;
  requestId: string;
  providerId: string;
  providerName: string;
  providerBusiness: string;
  providerPhone: string;
  providerImage: string;
  providerRating: number;
  quotedPrice: number;
  message: string;
  availableTime: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface ServiceRequest {
  id: string;
  userId?: string;
  customerName: string;
  customerPhone: string;
  category: string;
  subcategory: string;
  title: string;
  description: string;
  urgency: 'immediate' | 'today' | 'tomorrow' | 'flexible';
  preferredDate?: string;
  preferredTime?: string;
  address: string;
  locality: string;
  city: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  budget?: string;
  status: 'open' | 'quotes_received' | 'assigned' | 'completed' | 'cancelled';
  selectedQuoteId?: string;
  selectedProviderId?: string;
  quotes: ServiceRequestQuote[];
  createdAt: string;
}

export interface Enquiry {
  id: string;
  workerId?: string;
  workerName?: string;
  customerName: string;
  customerPhone: string;
  serviceRequested: string;
  preferredDate?: string;
  address: string;
  details?: string;
  status: 'new' | 'contacted' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface Report {
  id: string;
  workerId: string;
  workerName: string;
  reason: string;
  details: string;
  reporterPhone: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  phone: string;
  role: 'user' | 'worker' | 'admin' | 'superadmin';
  workerProfileId?: string;
  favourites: string[];
  searchHistory: string[];
  createdAt: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  contactPhone: string;
  contactEmail: string;
  autoApproveWorkers: boolean;
  defaultSearchRadiusKm: number;
  bannerNotice: string;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  city?: string;
  locality?: string;
  pincode?: string;
  formattedAddress?: string;
}

export interface PopularSearchItem {
  id: string;
  text: string;
  category?: string;
  subcategory?: string;
  count: number;
  tag?: string;
  type: 'category' | 'query';
}

export interface PopularLocationItem {
  name: string;
  city: string;
  searches: number;
  lat: number;
  lng: number;
  pincode?: string;
}

export interface PopularSearchesData {
  trendingQueries: PopularSearchItem[];
  topLocations: PopularLocationItem[];
  totalSearchesToday: number;
}

