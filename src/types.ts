export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  products: string[];
  location: string;
  phone: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
}
