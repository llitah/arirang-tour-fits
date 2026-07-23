export interface Profile {
  id: string;
  name: string;
}

export interface Look {
  id: string;
  title: string;
  description: string | null;
  artist: string | null;
  event: string | null;
  category: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface LookImage {
  id: string;
  look_id: string;
  image_url: string;
  order_index: number;
}

export interface Product {
  id: string;
  look_id: string;
  product_name: string;
  brand: string | null;
  price: number | null;
  url: string | null;
}

export interface Vote {
  id: string;
  look_id: string;
  profile_id: string;
  rating: number;
  created_at: string;
}

export interface VoteWithProfile extends Vote {
  profiles: Profile | null;
}

export interface Comment {
  id: string;
  look_id: string;
  profile_id: string;
  comment: string;
  created_at: string;
}

export interface CommentWithProfile extends Comment {
  profiles: Profile | null;
}

export interface Favorite {
  id: string;
  profile_id: string;
  look_id: string;
}

export interface LookWithRelations extends Look {
  creator: Profile | null;
  look_images: LookImage[];
  products: Product[];
  votes: VoteWithProfile[];
  comments: CommentWithProfile[];
  favorites: Favorite[];
}
