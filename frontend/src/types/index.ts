// User types
export interface User {
  id: number;
  name: string;
  email: string;
  address: string;
  role: string;
  storeId?: number;
  storeName?: string;
  rating?: number;
}

// Store types
export interface Store {
  id: number;
  name: string;
  email: string;
  address: string;
  ownerId: number | null;
  owner: {
    id: number;
    name: string;
    email: string;
  } | null;
  averageRating: number;
  userRating: number | null;
  ratingsCount: number;
}

// Rating types
export interface Rating {
  id: number;
  value: number;
  userId: number;
  storeId: number;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  createdAt?: string;
}

// Dashboard statistics
export interface DashboardStats {
  totalUsers: number;
  totalStores: number;
  totalRatings: number;
}

// Store owner dashboard
export interface StoreOwnerDashboard {
  id: number;
  name: string;
  email: string;
  address: string;
  averageRating: number;
  ratingsCount: number;
  ratings: Rating[];
}
