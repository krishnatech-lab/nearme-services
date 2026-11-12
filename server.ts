import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { INITIAL_CATEGORIES } from './src/data/categories.ts';
import { INITIAL_WORKERS, INITIAL_REVIEWS, INITIAL_SERVICE_REQUESTS } from './src/data/seedWorkers.ts';
import { WorkerProfile, Category, Review, Enquiry, Report, UserAccount, SiteSettings, ServiceRequest, ServiceRequestQuote, WorkerAvailabilityStatus, SpecialOffer } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface SearchLogRecord {
  id: string;
  query: string;
  category?: string;
  subcategory?: string;
  locality?: string;
  city?: string;
  count: number;
  lastSearchedAt: string;
}

const INITIAL_SEARCH_LOGS: SearchLogRecord[] = [
  { id: 'sl-1', query: 'Electrician', category: 'Home Repair & Maintenance', subcategory: 'Electrician', count: 482, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-2', query: 'AC Deep Jet Cleaning', category: 'Electronics & Appliances', subcategory: 'AC Technician', count: 415, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-3', query: 'Plumber', category: 'Home Repair & Maintenance', subcategory: 'Plumber', count: 389, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-4', query: 'Car Mechanic', category: 'Vehicle Services', subcategory: 'Car Mechanic', count: 310, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-5', query: 'House Deep Cleaning', category: 'Cleaning & Household Services', subcategory: 'House Cleaning', count: 275, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-6', query: 'Carpenter & Furniture Repair', category: 'Home Repair & Maintenance', subcategory: 'Carpenter', count: 295, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-7', query: 'CCTV Installer', category: 'Professional Services', subcategory: 'CCTV Installer', count: 185, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-8', query: 'Packers & Movers', category: 'Events & Other Services', subcategory: 'Packers & Movers', count: 210, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-9', query: 'Washing Machine Repair', category: 'Electronics & Appliances', subcategory: 'Washing Machine Repair', count: 195, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-10', query: 'Tyre Puncture Van', category: 'Vehicle Services', subcategory: 'Tyre Puncture Shop', count: 160, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-11', query: 'Indiranagar', locality: 'Indiranagar', city: 'Bengaluru', count: 520, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-12', query: 'Koramangala', locality: 'Koramangala', city: 'Bengaluru', count: 460, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-13', query: 'HSR Layout', locality: 'HSR Layout', city: 'Bengaluru', count: 390, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-14', query: 'Whitefield', locality: 'Whitefield', city: 'Bengaluru', count: 340, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-15', query: 'Connaught Place', locality: 'Connaught Place', city: 'New Delhi', count: 290, lastSearchedAt: new Date().toISOString() },
  { id: 'sl-16', query: 'Andheri West', locality: 'Andheri West', city: 'Mumbai', count: 310, lastSearchedAt: new Date().toISOString() }
];

interface DatabaseSchema {
  settings: SiteSettings;
  categories: Category[];
  workers: WorkerProfile[];
  reviews: Review[];
  enquiries: Enquiry[];
  reports: Report[];
  users: UserAccount[];
  serviceRequests: ServiceRequest[];
  searchLogs: SearchLogRecord[];
}

function getInitialDB(): DatabaseSchema {
  return {
    settings: {
      siteName: 'NearMe Services',
      tagline: 'Connect Instantly with Trusted Workers & Local Professionals',
      contactPhone: '+91 800-NEAR-ME',
      contactEmail: 'support@nearmeservices.local',
      autoApproveWorkers: false,
      defaultSearchRadiusKm: 10,
      bannerNotice: '⚡ 100% Verified Local Professionals. Direct Phone & WhatsApp Calling.',
    },
    categories: INITIAL_CATEGORIES,
    workers: INITIAL_WORKERS,
    reviews: INITIAL_REVIEWS,
    enquiries: [],
    reports: [],
    serviceRequests: INITIAL_SERVICE_REQUESTS,
    searchLogs: INITIAL_SEARCH_LOGS,
    users: [
      {
        id: 'admin-1',
        name: 'Super Administrator',
        phone: '+919999999999',
        role: 'superadmin',
        favourites: ['w-101', 'w-104'],
        searchHistory: ['Electrician', 'AC Technician', 'Indiranagar'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'user-1',
        name: 'Amit Customer',
        phone: '+919876500000',
        role: 'user',
        favourites: ['w-101'],
        searchHistory: ['Plumber Domlur'],
        createdAt: new Date().toISOString(),
      },
      {
        id: 'worker-user-101',
        name: 'Ramesh Sharma',
        phone: '+919876543210',
        role: 'worker',
        workerProfileId: 'w-101',
        favourites: [],
        searchHistory: [],
        createdAt: new Date().toISOString(),
      }
    ],
  };
}

function loadDB(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      const initial = getInitialDB();
      return {
        ...initial,
        ...parsed,
        categories: parsed.categories && parsed.categories.length > 0 ? parsed.categories : INITIAL_CATEGORIES,
        workers: (parsed.workers && parsed.workers.length > 0 ? parsed.workers : INITIAL_WORKERS).map((w: WorkerProfile) => {
          const seedWorker = INITIAL_WORKERS.find((sw) => sw.id === w.id);
          return {
            ...w,
            availabilityStatus: w.availabilityStatus || (w.isAvailable ? 'available_now' : 'offline'),
            specialOffers: w.specialOffers && w.specialOffers.length > 0 ? w.specialOffers : (seedWorker?.specialOffers || []),
          };
        }),
        serviceRequests: parsed.serviceRequests && parsed.serviceRequests.length > 0 ? parsed.serviceRequests : INITIAL_SERVICE_REQUESTS,
        searchLogs: parsed.searchLogs && parsed.searchLogs.length > 0 ? parsed.searchLogs : INITIAL_SEARCH_LOGS,
      };
    }
  } catch (err) {
    console.error('Error reading db.json, falling back to defaults:', err);
  }
  const initial = getInitialDB();
  saveDB(initial);
  return initial;
}

function saveDB(database: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

let db = loadDB();

// Haversine formula to calculate distance in KM
function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10;
}

// Temporary in-memory OTP storage for authentication
const activeOtps: Record<string, { code: string; expiresAt: number }> = {};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // ================= API ROUTES =================

  // 1. Config & Settings
  app.get('/api/config/maps-key', (req: Request, res: Response) => {
    const key = process.env.VITE_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || '';
    res.json({ apiKey: key });
  });

  app.get('/api/settings', (req: Request, res: Response) => {
    res.json(db.settings);
  });

  app.put('/api/settings', (req: Request, res: Response) => {
    db.settings = { ...db.settings, ...req.body };
    saveDB(db);
    res.json(db.settings);
  });

  // 2. Categories
  app.get('/api/categories', (req: Request, res: Response) => {
    const categoriesWithCount = db.categories.map((cat) => {
      const count = db.workers.filter(
        (w) => w.status === 'active' && (w.category.toLowerCase() === cat.name.toLowerCase() || w.category.toLowerCase() === cat.id.toLowerCase())
      ).length;
      return { ...cat, workerCount: count };
    });
    res.json(categoriesWithCount);
  });

  app.post('/api/categories', (req: Request, res: Response) => {
    const { name, icon, description, subcategories } = req.body;
    if (!name) return res.status(400).json({ error: 'Category name is required' });
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newCategory: Category = {
      id,
      name,
      icon: icon || 'Briefcase',
      description: description || '',
      subcategories: Array.isArray(subcategories) ? subcategories : [],
    };
    db.categories.push(newCategory);
    saveDB(db);
    res.status(201).json(newCategory);
  });

  app.put('/api/categories/:id', (req: Request, res: Response) => {
    const catIndex = db.categories.findIndex((c) => c.id === req.params.id);
    if (catIndex === -1) return res.status(400).json({ error: 'Category not found' });
    db.categories[catIndex] = { ...db.categories[catIndex], ...req.body };
    saveDB(db);
    res.json(db.categories[catIndex]);
  });

  app.delete('/api/categories/:id', (req: Request, res: Response) => {
    db.categories = db.categories.filter((c) => c.id !== req.params.id);
    saveDB(db);
    res.json({ success: true });
  });

  // 3. Workers Discovery & Search
  app.get('/api/workers', (req: Request, res: Response) => {
    const {
      search,
      category,
      subcategory,
      lat,
      lng,
      radius,
      sort,
      isVerified,
      isAvailable,
      availabilityStatus,
      minRating,
      status,
    } = req.query;

    const userLat = lat ? parseFloat(lat as string) : null;
    const userLng = lng ? parseFloat(lng as string) : null;
    const maxRadius = radius ? parseFloat(radius as string) : null;

    let filtered = db.workers.map((w) => {
      let distanceKm = undefined;
      if (userLat !== null && userLng !== null && !isNaN(userLat) && !isNaN(userLng)) {
        distanceKm = calculateDistanceKm(userLat, userLng, w.latitude, w.longitude);
      }
      return { ...w, distanceKm };
    });

    // Status filter: defaults to 'active' for public
    if (status && status !== 'all') {
      filtered = filtered.filter((w) => w.status === status);
    } else if (!status) {
      filtered = filtered.filter((w) => w.status === 'active');
    }

    // Category filter
    if (category && category !== 'all') {
      const catStr = (category as string).toLowerCase();
      filtered = filtered.filter(
        (w) => w.category.toLowerCase() === catStr || w.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') === catStr
      );
    }

    // Subcategory filter
    if (subcategory && subcategory !== 'all') {
      const subStr = (subcategory as string).toLowerCase();
      filtered = filtered.filter((w) => w.subcategory.toLowerCase() === subStr);
    }

    // Availability status filter ('available_now' | 'on_job' | 'offline')
    if (availabilityStatus && availabilityStatus !== 'all') {
      filtered = filtered.filter((w) => w.availabilityStatus === availabilityStatus);
    } else if (isAvailable === 'true') {
      filtered = filtered.filter((w) => w.availabilityStatus === 'available_now' || w.isAvailable);
    }

    // Verified filter
    if (isVerified === 'true') {
      filtered = filtered.filter((w) => w.isVerified);
    }

    // Min rating filter
    if (minRating) {
      const minR = parseFloat(minRating as string);
      if (!isNaN(minR)) {
        filtered = filtered.filter((w) => w.rating >= minR);
      }
    }

    // Search query
    if (search && (search as string).trim()) {
      const q = (search as string).toLowerCase().trim();
      filtered = filtered.filter((w) => {
        return (
          w.name.toLowerCase().includes(q) ||
          w.businessName.toLowerCase().includes(q) ||
          w.phone.includes(q) ||
          w.subcategory.toLowerCase().includes(q) ||
          w.category.toLowerCase().includes(q) ||
          w.locality.toLowerCase().includes(q) ||
          w.city.toLowerCase().includes(q) ||
          w.pincode.includes(q) ||
          w.services.some((s) => s.toLowerCase().includes(q))
        );
      });
    }

    // Radius filter
    if (userLat !== null && userLng !== null && maxRadius !== null && !isNaN(maxRadius) && maxRadius > 0) {
      filtered = filtered.filter((w) => w.distanceKm !== undefined && w.distanceKm <= maxRadius);
    }

    // Sorting
    if (sort === 'nearest' && userLat !== null && userLng !== null) {
      filtered.sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999));
    } else if (sort === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
    } else if (sort === 'experience') {
      filtered.sort((a, b) => b.experienceYears - a.experienceYears);
    } else if (sort === 'recent') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Default: Available Now first, featured first, then nearest or highest rated
      filtered.sort((a, b) => {
        if (a.availabilityStatus === 'available_now' && b.availabilityStatus !== 'available_now') return -1;
        if (a.availabilityStatus !== 'available_now' && b.availabilityStatus === 'available_now') return 1;
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        if (userLat !== null && userLng !== null) {
          return (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999);
        }
        return b.rating - a.rating;
      });
    }

    res.json(filtered);
  });

  // 4. Single Worker Profile
  app.get('/api/workers/:id', (req: Request, res: Response) => {
    const worker = db.workers.find((w) => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    
    worker.viewsCount = (worker.viewsCount || 0) + 1;
    saveDB(db);

    const reviews = db.reviews.filter((r) => r.workerId === worker.id);
    res.json({ worker, reviews });
  });

  // 5. Worker Registration / Creation
  app.post('/api/workers', (req: Request, res: Response) => {
    const {
      name,
      businessName,
      phone,
      whatsapp,
      category,
      subcategory,
      profileImage,
      bio,
      experienceYears,
      workingHours,
      pricing,
      address,
      locality,
      city,
      state,
      pincode,
      latitude,
      longitude,
      services,
      languages,
    } = req.body;

    if (!name || !phone || !category || !subcategory || !address) {
      return res.status(400).json({ error: 'Required fields: Name, Phone, Category, Subcategory, Address' });
    }

    const id = 'w-' + Date.now();
    const newWorker: WorkerProfile = {
      id,
      name,
      businessName: businessName || name + ' Services',
      phone,
      whatsapp: whatsapp || phone,
      category,
      subcategory,
      profileImage: profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=400',
      bio: bio || `${subcategory} professional with ${experienceYears || 1}+ years experience serving ${locality || city || 'local area'}.`,
      experienceYears: parseInt(experienceYears, 10) || 1,
      rating: 5.0,
      reviewCount: 0,
      isVerified: false,
      isAvailable: true,
      availabilityStatus: 'available_now',
      isFeatured: false,
      status: db.settings.autoApproveWorkers ? 'active' : 'pending',
      workingHours: workingHours || '9:00 AM - 8:00 PM',
      pricing: pricing || 'Inspection charge on request',
      address,
      locality: locality || '',
      city: city || 'Bengaluru',
      state: state || 'Karnataka',
      pincode: pincode || '',
      latitude: parseFloat(latitude) || 12.9716,
      longitude: parseFloat(longitude) || 77.5946,
      services: Array.isArray(services) && services.length > 0 ? services : [subcategory],
      languages: Array.isArray(languages) && languages.length > 0 ? languages : ['Hindi', 'English'],
      createdAt: new Date().toISOString(),
      viewsCount: 0,
    };

    db.workers.unshift(newWorker);
    saveDB(db);

    res.status(201).json(newWorker);
  });

  // 6. Update Worker Profile
  app.put('/api/workers/:id', (req: Request, res: Response) => {
    const index = db.workers.findIndex((w) => w.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Worker not found' });

    db.workers[index] = { ...db.workers[index], ...req.body };
    saveDB(db);
    res.json(db.workers[index]);
  });

  // 7. Delete Worker
  app.delete('/api/workers/:id', (req: Request, res: Response) => {
    db.workers = db.workers.filter((w) => w.id !== req.params.id);
    db.reviews = db.reviews.filter((r) => r.workerId !== req.params.id);
    saveDB(db);
    res.json({ success: true });
  });

  // 8. Worker Availability Status & toggles
  app.patch('/api/workers/:id/availability-status', (req: Request, res: Response) => {
    const worker = db.workers.find((w) => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    const { status } = req.body as { status: WorkerAvailabilityStatus };
    if (!['available_now', 'on_job', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Invalid availability status' });
    }
    worker.availabilityStatus = status;
    worker.isAvailable = status === 'available_now';
    saveDB(db);
    res.json(worker);
  });

  app.patch('/api/workers/:id/status', (req: Request, res: Response) => {
    const worker = db.workers.find((w) => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    worker.status = req.body.status;
    saveDB(db);
    res.json(worker);
  });

  app.patch('/api/workers/:id/verify', (req: Request, res: Response) => {
    const worker = db.workers.find((w) => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    worker.isVerified = typeof req.body.isVerified === 'boolean' ? req.body.isVerified : !worker.isVerified;
    saveDB(db);
    res.json(worker);
  });

  app.patch('/api/workers/:id/feature', (req: Request, res: Response) => {
    const worker = db.workers.find((w) => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    worker.isFeatured = typeof req.body.isFeatured === 'boolean' ? req.body.isFeatured : !worker.isFeatured;
    saveDB(db);
    res.json(worker);
  });

  // 9. Reviews & Ratings
  app.get('/api/workers/:id/reviews', (req: Request, res: Response) => {
    const reviews = db.reviews.filter((r) => r.workerId === req.params.id);
    res.json(reviews);
  });

  app.post('/api/workers/:id/reviews', (req: Request, res: Response) => {
    const worker = db.workers.find((w) => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const { userName, userPhone, rating, comment } = req.body;
    if (!userName || !rating || !comment) {
      return res.status(400).json({ error: 'Name, rating and review text are required' });
    }

    const numRating = Math.max(1, Math.min(5, parseFloat(rating)));
    const newReview: Review = {
      id: 'rev-' + Date.now(),
      workerId: worker.id,
      userName,
      userPhone: userPhone || '',
      rating: numRating,
      comment,
      createdAt: new Date().toISOString(),
    };

    db.reviews.unshift(newReview);

    const workerReviews = db.reviews.filter((r) => r.workerId === worker.id);
    const avg = workerReviews.reduce((sum, r) => sum + r.rating, 0) / workerReviews.length;
    worker.rating = Math.round(avg * 10) / 10;
    worker.reviewCount = workerReviews.length;

    saveDB(db);
    res.status(201).json({ review: newReview, worker });
  });

  // 9b. Worker Special Offers & Promotional Coupons
  app.get('/api/workers/:id/offers', (req: Request, res: Response) => {
    const worker = db.workers.find((w) => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    res.json(worker.specialOffers || []);
  });

  app.post('/api/workers/:id/offers', (req: Request, res: Response) => {
    const worker = db.workers.find((w) => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const {
      title,
      discountType,
      discountValue,
      couponCode,
      description,
      locality,
      validUntil,
      minOrderAmount,
      terms,
    } = req.body;

    if (!title || !discountValue || !couponCode) {
      return res.status(400).json({ error: 'Title, Discount Value, and Coupon Code are required' });
    }

    const newOffer: SpecialOffer = {
      id: 'off-' + Date.now(),
      workerId: worker.id,
      title: title.trim(),
      discountType: discountType || 'percentage',
      discountValue: discountValue.trim(),
      couponCode: couponCode.trim().toUpperCase(),
      description: (description || '').trim(),
      locality: (locality || worker.locality || worker.city || 'Local Area').trim(),
      validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
      terms: (terms || 'Mention this coupon code on phone call or WhatsApp booking via NearMe Services').trim(),
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    if (!worker.specialOffers) {
      worker.specialOffers = [];
    }
    worker.specialOffers.unshift(newOffer);
    saveDB(db);

    res.status(201).json({ offer: newOffer, worker });
  });

  app.delete('/api/workers/:workerId/offers/:offerId', (req: Request, res: Response) => {
    const worker = db.workers.find((w) => w.id === req.params.workerId);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    if (worker.specialOffers) {
      worker.specialOffers = worker.specialOffers.filter((o) => o.id !== req.params.offerId);
      saveDB(db);
    }
    res.json({ success: true, specialOffers: worker.specialOffers || [] });
  });

  // ================= 10. PROACTIVE SERVICE REQUESTS & QUOTES =================
  app.get('/api/service-requests', (req: Request, res: Response) => {
    const { category, status, customerPhone } = req.query;
    let list = [...(db.serviceRequests || [])];

    if (category && category !== 'all') {
      const catStr = (category as string).toLowerCase();
      list = list.filter((r) => r.category.toLowerCase().includes(catStr) || r.subcategory.toLowerCase().includes(catStr));
    }

    if (status && status !== 'all') {
      list = list.filter((r) => r.status === status);
    }

    if (customerPhone) {
      list = list.filter((r) => r.customerPhone === customerPhone);
    }

    // Newest first
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json(list);
  });

  app.get('/api/service-requests/:id', (req: Request, res: Response) => {
    const request = db.serviceRequests?.find((r) => r.id === req.params.id);
    if (!request) return res.status(404).json({ error: 'Service request not found' });
    res.json(request);
  });

  app.post('/api/service-requests', (req: Request, res: Response) => {
    const {
      customerName,
      customerPhone,
      category,
      subcategory,
      title,
      description,
      urgency,
      preferredDate,
      preferredTime,
      address,
      locality,
      city,
      pincode,
      latitude,
      longitude,
      budget,
      userId,
    } = req.body;

    if (!customerName || !customerPhone || !category || !subcategory || !description || !address) {
      return res.status(400).json({ error: 'Please fill in all required fields' });
    }

    const newRequest: ServiceRequest = {
      id: 'sr-' + Date.now(),
      userId,
      customerName,
      customerPhone,
      category,
      subcategory,
      title: title || `${subcategory} required in ${locality || city || 'my area'}`,
      description,
      urgency: urgency || 'today',
      preferredDate: preferredDate || new Date().toISOString().split('T')[0],
      preferredTime: preferredTime || 'Flexible',
      address,
      locality: locality || '',
      city: city || 'Bengaluru',
      pincode: pincode || '',
      latitude: parseFloat(latitude) || 12.9784,
      longitude: parseFloat(longitude) || 77.6408,
      budget: budget || 'Best Quote',
      status: 'open',
      quotes: [],
      createdAt: new Date().toISOString(),
    };

    if (!db.serviceRequests) db.serviceRequests = [];
    db.serviceRequests.unshift(newRequest);
    saveDB(db);
    res.status(201).json(newRequest);
  });

  // Providers respond with quote
  app.post('/api/service-requests/:id/quotes', (req: Request, res: Response) => {
    const request = db.serviceRequests?.find((r) => r.id === req.params.id);
    if (!request) return res.status(404).json({ error: 'Service request not found' });

    const {
      providerId,
      providerName,
      providerBusiness,
      providerPhone,
      providerImage,
      providerRating,
      quotedPrice,
      message,
      availableTime,
    } = req.body;

    if (!providerName || !quotedPrice || !providerPhone) {
      return res.status(400).json({ error: 'Quote price, provider name, and phone are required' });
    }

    const newQuote: ServiceRequestQuote = {
      id: 'q-' + Date.now(),
      requestId: request.id,
      providerId: providerId || 'w-custom',
      providerName,
      providerBusiness: providerBusiness || providerName + ' Services',
      providerPhone,
      providerImage: providerImage || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
      providerRating: parseFloat(providerRating) || 5.0,
      quotedPrice: parseFloat(quotedPrice),
      message: message || 'Available to complete this job with guaranteed quality.',
      availableTime: availableTime || 'Ready Now',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    request.quotes.push(newQuote);
    if (request.status === 'open') {
      request.status = 'quotes_received';
    }
    saveDB(db);
    res.status(201).json({ request, quote: newQuote });
  });

  // User accepts quote
  app.post('/api/service-requests/:id/accept-quote', (req: Request, res: Response) => {
    const request = db.serviceRequests?.find((r) => r.id === req.params.id);
    if (!request) return res.status(404).json({ error: 'Service request not found' });

    const { quoteId } = req.body;
    const quote = request.quotes.find((q) => q.id === quoteId);
    if (!quote) return res.status(404).json({ error: 'Quote not found' });

    request.quotes.forEach((q) => {
      q.status = q.id === quoteId ? 'accepted' : 'declined';
    });
    request.status = 'assigned';
    request.selectedQuoteId = quote.id;
    request.selectedProviderId = quote.providerId;

    saveDB(db);
    res.json({ request, acceptedQuote: quote });
  });

  // 11. Enquiries
  app.post('/api/enquiries', (req: Request, res: Response) => {
    const { workerId, workerName, customerName, customerPhone, serviceRequested, preferredDate, address, details } = req.body;
    if (!customerName || !customerPhone || !serviceRequested || !address) {
      return res.status(400).json({ error: 'Name, phone, service requested, and address are required' });
    }

    const newEnquiry: Enquiry = {
      id: 'enq-' + Date.now(),
      workerId,
      workerName: workerName || 'General Enquiry',
      customerName,
      customerPhone,
      serviceRequested,
      preferredDate,
      address,
      details,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    db.enquiries.unshift(newEnquiry);
    saveDB(db);
    res.status(201).json(newEnquiry);
  });

  app.get('/api/enquiries', (req: Request, res: Response) => {
    res.json(db.enquiries);
  });

  app.patch('/api/enquiries/:id/status', (req: Request, res: Response) => {
    const enq = db.enquiries.find((e) => e.id === req.params.id);
    if (!enq) return res.status(404).json({ error: 'Enquiry not found' });
    enq.status = req.body.status;
    saveDB(db);
    res.json(enq);
  });

  // 12. Report Incorrect Information / Complaints
  app.post('/api/workers/:id/report', (req: Request, res: Response) => {
    const worker = db.workers.find((w) => w.id === req.params.id);
    if (!worker) return res.status(404).json({ error: 'Worker not found' });

    const { reason, details, reporterPhone } = req.body;
    if (!reason || !details) {
      return res.status(400).json({ error: 'Reason and details are required' });
    }

    const report: Report = {
      id: 'rep-' + Date.now(),
      workerId: worker.id,
      workerName: worker.name + ' (' + worker.businessName + ')',
      reason,
      details,
      reporterPhone: reporterPhone || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    db.reports.unshift(report);
    saveDB(db);
    res.status(201).json(report);
  });

  app.get('/api/reports', (req: Request, res: Response) => {
    res.json(db.reports);
  });

  app.patch('/api/reports/:id/status', (req: Request, res: Response) => {
    const rep = db.reports.find((r) => r.id === req.params.id);
    if (!rep) return res.status(404).json({ error: 'Report not found' });
    rep.status = req.body.status;
    saveDB(db);
    res.json(rep);
  });

  // 13. User Auth & OTP
  app.post('/api/auth/otp/send', (req: Request, res: Response) => {
    const { phone } = req.body;
    if (!phone || phone.length < 10) {
      return res.status(400).json({ error: 'Valid 10-digit mobile number is required' });
    }
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    activeOtps[phone] = {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    console.log(`[AUTH OTP] Sent to ${phone}: ${code}`);
    res.json({
      success: true,
      message: `OTP sent to ${phone}`,
      debugOtp: code,
    });
  });

  app.post('/api/auth/otp/verify', (req: Request, res: Response) => {
    const { phone, code, name, requestedRole, workerProfileId } = req.body;
    if (!phone || !code) {
      return res.status(400).json({ error: 'Phone and OTP are required' });
    }

    const record = activeOtps[phone];
    const isValid = (record && record.code === code && Date.now() <= record.expiresAt) || code === '123456' || (record && record.code === code);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid or expired OTP. You may use 123456 or the code shown on screen.' });
    }

    delete activeOtps[phone];

    let user = db.users.find((u) => u.phone === phone);
    if (!user) {
      const isAdmin = phone === '+919999999999' || phone === '9999999999';
      user = {
        id: 'u-' + Date.now(),
        name: name || (isAdmin ? 'System Admin' : 'User ' + phone.slice(-4)),
        phone,
        role: isAdmin ? 'superadmin' : requestedRole === 'worker' ? 'worker' : 'user',
        workerProfileId,
        favourites: [],
        searchHistory: [],
        createdAt: new Date().toISOString(),
      };
      db.users.push(user);
      saveDB(db);
    }

    res.json({
      success: true,
      user,
      token: 'token-' + user.id + '-' + Date.now(),
    });
  });

  // User Favourites & History
  app.post('/api/users/:id/favourites', (req: Request, res: Response) => {
    const user = db.users.find((u) => u.id === req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { workerId } = req.body;
    if (user.favourites.includes(workerId)) {
      user.favourites = user.favourites.filter((id) => id !== workerId);
    } else {
      user.favourites.push(workerId);
    }
    saveDB(db);
    res.json(user.favourites);
  });

  // 14. Admin Dashboard Analytics & Stats
  app.get('/api/admin/stats', (req: Request, res: Response) => {
    const totalWorkers = db.workers.length;
    const activeWorkers = db.workers.filter((w) => w.status === 'active').length;
    const pendingWorkers = db.workers.filter((w) => w.status === 'pending').length;
    const verifiedWorkers = db.workers.filter((w) => w.isVerified).length;
    const availableNowWorkers = db.workers.filter((w) => w.availabilityStatus === 'available_now').length;
    const totalReviews = db.reviews.length;
    const totalEnquiries = db.enquiries.length;
    const totalServiceRequests = db.serviceRequests?.length || 0;
    const pendingReports = db.reports.filter((r) => r.status === 'pending').length;
    const totalViews = db.workers.reduce((acc, w) => acc + (w.viewsCount || 0), 0);

    res.json({
      totalWorkers,
      activeWorkers,
      pendingWorkers,
      verifiedWorkers,
      availableNowWorkers,
      totalReviews,
      totalEnquiries,
      totalServiceRequests,
      pendingReports,
      totalViews,
      categoriesCount: db.categories.length,
      usersCount: db.users.length,
    });
  });

  // 15. Bulk CSV Import
  app.post('/api/admin/import-csv', (req: Request, res: Response) => {
    const { csvData } = req.body;
    if (!csvData || typeof csvData !== 'string') {
      return res.status(400).json({ error: 'CSV string data is required' });
    }

    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
      return res.status(400).json({ error: 'CSV must contain at least a header and 1 row' });
    }

    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
    let importedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',').map((v) => v.trim());
      if (row.length < 3) continue;

      const record: Record<string, string> = {};
      headers.forEach((h, index) => {
        record[h] = row[index] || '';
      });

      const name = record['name'] || record['worker_name'] || 'Verified Worker';
      const phone = record['phone'] || record['mobile'] || '+919876543210';
      const category = record['category'] || 'Home Repair & Maintenance';
      const subcategory = record['subcategory'] || record['service'] || 'Electrician';

      const worker: WorkerProfile = {
        id: 'w-csv-' + Date.now() + '-' + i,
        name,
        businessName: record['business_name'] || name + ' Services',
        phone,
        whatsapp: record['whatsapp'] || phone,
        category,
        subcategory,
        profileImage: record['profile_image'] || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
        bio: record['bio'] || `${subcategory} specialist with verified background.`,
        experienceYears: parseInt(record['experience'] || '5', 10),
        rating: parseFloat(record['rating'] || '5.0'),
        reviewCount: parseInt(record['reviews'] || '0', 10),
        isVerified: true,
        isAvailable: true,
        availabilityStatus: 'available_now',
        isFeatured: false,
        status: 'active',
        workingHours: record['hours'] || '8:00 AM - 8:00 PM',
        pricing: record['pricing'] || '₹250 Inspection',
        address: record['address'] || 'Main Road',
        locality: record['locality'] || 'Indiranagar',
        city: record['city'] || 'Bengaluru',
        state: record['state'] || 'Karnataka',
        pincode: record['pincode'] || '560038',
        latitude: parseFloat(record['latitude'] || '12.9784'),
        longitude: parseFloat(record['longitude'] || '77.6408'),
        services: [subcategory],
        languages: ['Hindi', 'English'],
        createdAt: new Date().toISOString(),
        viewsCount: 0,
      };

      db.workers.unshift(worker);
      importedCount++;
    }

    saveDB(db);
    res.json({ success: true, count: importedCount });
  });

  // 16. Popular Searches & Trending Locations Analytics
  app.get('/api/popular-searches', (req: Request, res: Response) => {
    const logs = db.searchLogs && db.searchLogs.length > 0 ? db.searchLogs : INITIAL_SEARCH_LOGS;

    // Filter queries that are service categories or trades
    const serviceQueries = logs
      .filter((l) => l.subcategory || l.category)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((item) => {
        let tag = 'Popular';
        if (item.count > 400) tag = '🔥 Trending';
        else if (item.subcategory === 'Electrician' || item.subcategory === 'Plumber') tag = '⚡ 24/7';
        else if (item.count > 300) tag = '★ Top Rated';

        return {
          id: item.id,
          text: item.query || item.subcategory || 'Service',
          category: item.category,
          subcategory: item.subcategory,
          count: item.count,
          tag,
          type: 'category' as const,
        };
      });

    // Top trending locations
    const topLocations = [
      { name: 'Indiranagar', city: 'Bengaluru', searches: 520, lat: 12.9784, lng: 77.6408, pincode: '560038' },
      { name: 'Koramangala', city: 'Bengaluru', searches: 460, lat: 12.9352, lng: 77.6245, pincode: '560034' },
      { name: 'HSR Layout', city: 'Bengaluru', searches: 390, lat: 12.9121, lng: 77.6446, pincode: '560102' },
      { name: 'Whitefield', city: 'Bengaluru', searches: 340, lat: 12.9698, lng: 77.7499, pincode: '560066' },
      { name: 'Connaught Place', city: 'New Delhi', searches: 290, lat: 28.6315, lng: 77.2167, pincode: '110001' },
      { name: 'Andheri West', city: 'Mumbai', searches: 310, lat: 19.1136, lng: 72.8697, pincode: '400058' },
    ];

    const totalSearchesToday = logs.reduce((acc, l) => acc + (l.count || 0), 0) + 142;

    res.json({
      trendingQueries: serviceQueries,
      topLocations,
      totalSearchesToday,
    });
  });

  app.post('/api/search-log', (req: Request, res: Response) => {
    const { query, category, subcategory, locality, city } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query required' });
    }

    const q = query.trim().toLowerCase();
    if (!db.searchLogs) db.searchLogs = [...INITIAL_SEARCH_LOGS];

    let record = db.searchLogs.find((l) => l.query.toLowerCase() === q);
    if (record) {
      record.count = (record.count || 0) + 1;
      record.lastSearchedAt = new Date().toISOString();
    } else {
      record = {
        id: 'sl-' + Date.now(),
        query: query.trim(),
        category,
        subcategory,
        locality,
        city,
        count: 1,
        lastSearchedAt: new Date().toISOString(),
      };
      db.searchLogs.push(record);
    }
    saveDB(db);
    res.json({ success: true, record });
  });

  // ================= VITE MIDDLEWARE / STATIC SERVING =================
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NearMe Services server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
