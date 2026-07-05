import { Track, Album, Artist, Playlist, BannerConfig, Category } from '../types/index.js';

export const INITIAL_BANNER: BannerConfig = {
  id: 'banner-1',
  title: 'Discover Unlimited Free Independent Music',
  subtitle: 'Stream over 500,000 Creative Commons tracks from Jamendo without subscription barriers.',
  buttonText: 'Explore Trending Now',
  buttonLink: 'trending',
  imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1600&q=80',
  active: true,
};

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Electronic & Synth', tag: 'electronic', color: 'from-purple-600 to-indigo-600', icon: 'Zap' },
  { id: 'cat-2', name: 'Lo-Fi Beats & Chill', tag: 'lofi', color: 'from-emerald-600 to-teal-600', icon: 'Coffee' },
  { id: 'cat-3', name: 'Indie Rock & Pop', tag: 'rock', color: 'from-rose-600 to-pink-600', icon: 'Guitar' },
  { id: 'cat-4', name: 'Acoustic & Folk', tag: 'acoustic', color: 'from-amber-600 to-orange-600', icon: 'Sun' },
  { id: 'cat-5', name: 'Cinematic & Ambient', tag: 'cinematic', color: 'from-blue-600 to-cyan-600', icon: 'Film' },
  { id: 'cat-6', name: 'Jazz & Soul Vibes', tag: 'jazz', color: 'from-violet-600 to-fuchsia-600', icon: 'Headphones' },
];

export const FALLBACK_TRACKS: Track[] = [
  {
    id: 'mock-shape-of-you',
    name: 'Shape Of you',
    artist_id: 'art-ed',
    artist_name: 'ED sheraan',
    album_id: 'alb-divide',
    album_name: 'Divide Beats',
    duration: 249,
    album_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1888998&format=mp31&from=app-97deb',
    releasedate: '2026-06-01',
    tags: ['pop', 'rnb', 'recent', 'top50'],
    plays: 985000,
    likes: 85200
  },
  {
    id: 'mock-alone',
    name: 'Alone',
    artist_id: 'art-alan',
    artist_name: 'Allen Walker',
    album_id: 'alb-edm',
    album_name: 'EDM Music Best Mix',
    duration: 249,
    album_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1875421&format=mp31&from=app-97deb',
    releasedate: '2026-05-15',
    tags: ['edm', 'electronic', 'recent', 'top50'],
    plays: 820000,
    likes: 71000
  },
  {
    id: 'mock-lonely',
    name: 'Lonely',
    artist_id: 'art-akon',
    artist_name: 'Akon',
    album_id: 'alb-rnb',
    album_name: 'R&B Playlist',
    duration: 249,
    album_image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1864320&format=mp31&from=app-97deb',
    releasedate: '2026-04-20',
    tags: ['rnb', 'chill', 'recent'],
    plays: 640000,
    likes: 53000
  },
  {
    id: 'mock-baby',
    name: 'Baby baby',
    artist_id: 'art-justin',
    artist_name: 'Justin Star',
    album_id: 'alb-pop',
    album_name: 'Daily Mix 2',
    duration: 214,
    album_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1891234&format=mp31&from=app-97deb',
    releasedate: '2026-03-10',
    tags: ['pop', 'recent', 'chill'],
    plays: 510000,
    likes: 42000
  },
  {
    id: '1888998',
    name: 'Midnight Cyber Drive',
    artist_id: 'art-1',
    artist_name: 'Voxel Waves',
    album_id: 'alb-101',
    album_name: 'Neon Horizon',
    duration: 214,
    album_image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1888998&format=mp31&from=app-97deb',
    releasedate: '2025-11-12',
    tags: ['electronic', 'synthwave', 'chill'],
    plays: 45200,
    likes: 3410
  },
  {
    id: '1891234',
    name: 'Sunny Acoustic Morning',
    artist_id: 'art-4',
    artist_name: 'Elena Rostova',
    album_id: 'alb-104',
    album_name: 'Coffee & Sunbeams',
    duration: 185,
    album_image: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1891234&format=mp31&from=app-97deb',
    releasedate: '2026-03-01',
    tags: ['acoustic', 'folk', 'happy'],
    plays: 38100,
    likes: 2890
  },
  {
    id: '1875421',
    name: 'Lo-Fi Dreams in Tokyo',
    artist_id: 'art-2',
    artist_name: 'Kaito Takahashi',
    album_id: 'alb-102',
    album_name: 'Rainy Shibuya Night',
    duration: 168,
    album_image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1875421&format=mp31&from=app-97deb',
    releasedate: '2026-01-20',
    tags: ['lofi', 'chill', 'beats'],
    plays: 89400,
    likes: 7120
  },
  {
    id: '1864320',
    name: 'Epic Mountains Interstellar',
    artist_id: 'art-3',
    artist_name: 'Aurora Borealis Orchestra',
    album_id: 'alb-103',
    album_name: 'Cosmic Journeys',
    duration: 245,
    album_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1864320&format=mp31&from=app-97deb',
    releasedate: '2025-08-15',
    tags: ['cinematic', 'epic', 'ambient'],
    plays: 62000,
    likes: 5400
  },
  {
    id: '1853210',
    name: 'Funky Sunset Groove',
    artist_id: 'art-5',
    artist_name: 'The Brass Collective',
    album_id: 'alb-105',
    album_name: 'Summer Rhythm',
    duration: 198,
    album_image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1853210&format=mp31&from=app-97deb',
    releasedate: '2025-06-10',
    tags: ['jazz', 'funk', 'soul'],
    plays: 31500,
    likes: 2150
  },
  {
    id: '1849900',
    name: 'Electric Pulse Highway',
    artist_id: 'art-6',
    artist_name: 'Synthetix 84',
    album_id: 'alb-106',
    album_name: 'Retrograde',
    duration: 220,
    album_image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1849900&format=mp31&from=app-97deb',
    releasedate: '2025-09-28',
    tags: ['electronic', 'retrowave', 'synth'],
    plays: 74200,
    likes: 6300
  },
  {
    id: '1832145',
    name: 'Starlight Acoustic Ballad',
    artist_id: 'art-7',
    artist_name: 'Maya & The Strings',
    album_id: 'alb-107',
    album_name: 'Echoes of Forest',
    duration: 210,
    album_image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1832145&format=mp31&from=app-97deb',
    releasedate: '2025-05-14',
    tags: ['acoustic', 'indie', 'vocal'],
    plays: 29800,
    likes: 1980
  },
  {
    id: '1821098',
    name: 'Deep House Mirage',
    artist_id: 'art-8',
    artist_name: 'DJ Solitude',
    album_id: 'alb-108',
    album_name: 'Ibiza Twilight',
    duration: 260,
    album_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1821098&format=mp31&from=app-97deb',
    releasedate: '2025-07-22',
    tags: ['electronic', 'house', 'dance'],
    plays: 91200,
    likes: 8120
  },
  {
    id: '1810001',
    name: 'Indie Rock Anthem',
    artist_id: 'art-1',
    artist_name: 'Voxel Waves',
    album_id: 'alb-101',
    album_name: 'Neon Horizon',
    duration: 205,
    album_image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1888998&format=mp31&from=app-97deb',
    releasedate: '2026-02-14',
    tags: ['rock', 'indie', 'guitar'],
    plays: 53100,
    likes: 4210
  },
  {
    id: '1810002',
    name: 'Midnight Study Sessions',
    artist_id: 'art-2',
    artist_name: 'Kaito Takahashi',
    album_id: 'alb-102',
    album_name: 'Rainy Shibuya Night',
    duration: 190,
    album_image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1875421&format=mp31&from=app-97deb',
    releasedate: '2026-03-10',
    tags: ['lofi', 'chill', 'study'],
    plays: 68400,
    likes: 5910
  },
  {
    id: '1810003',
    name: 'Galactic Horizon Voyage',
    artist_id: 'art-3',
    artist_name: 'Aurora Borealis Orchestra',
    album_id: 'alb-103',
    album_name: 'Cosmic Journeys',
    duration: 230,
    album_image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1864320&format=mp31&from=app-97deb',
    releasedate: '2026-01-05',
    tags: ['cinematic', 'ambient', 'soundtrack'],
    plays: 41200,
    likes: 3820
  },
  {
    id: '1810004',
    name: 'Golden Hour Campfire',
    artist_id: 'art-4',
    artist_name: 'Elena Rostova',
    album_id: 'alb-104',
    album_name: 'Coffee & Sunbeams',
    duration: 175,
    album_image: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?auto=format&fit=crop&w=500&q=80',
    audio: 'https://prod-1.storage.jamendo.com/?trackid=1891234&format=mp31&from=app-97deb',
    releasedate: '2026-03-20',
    tags: ['acoustic', 'folk', 'chill'],
    plays: 39500,
    likes: 3100
  }
];

export const FALLBACK_ALBUMS: Album[] = [
  {
    id: 'alb-101',
    name: 'Neon Horizon',
    artist_id: 'art-1',
    artist_name: 'Voxel Waves',
    releasedate: '2025-11-12',
    image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'alb-102',
    name: 'Rainy Shibuya Night',
    artist_id: 'art-2',
    artist_name: 'Kaito Takahashi',
    releasedate: '2026-01-20',
    image: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'alb-103',
    name: 'Cosmic Journeys',
    artist_id: 'art-3',
    artist_name: 'Aurora Borealis Orchestra',
    releasedate: '2025-08-15',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'alb-104',
    name: 'Coffee & Sunbeams',
    artist_id: 'art-4',
    artist_name: 'Elena Rostova',
    releasedate: '2026-03-01',
    image: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'alb-105',
    name: 'Summer Rhythm',
    artist_id: 'art-5',
    artist_name: 'The Brass Collective',
    releasedate: '2025-06-10',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'alb-106',
    name: 'Retrograde',
    artist_id: 'art-6',
    artist_name: 'Synthetix 84',
    releasedate: '2025-09-28',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'alb-107',
    name: 'Echoes of Forest',
    artist_id: 'art-7',
    artist_name: 'Maya & The Strings',
    releasedate: '2025-05-14',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'alb-108',
    name: 'Ibiza Twilight',
    artist_id: 'art-8',
    artist_name: 'DJ Solitude',
    releasedate: '2025-07-22',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80'
  }
];

export const FALLBACK_ARTISTS: Artist[] = [
  {
    id: 'art-1',
    name: 'Voxel Waves',
    joindate: '2024-04-10',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'art-2',
    name: 'Kaito Takahashi',
    joindate: '2023-11-05',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'art-3',
    name: 'Aurora Borealis Orchestra',
    joindate: '2022-09-18',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'art-4',
    name: 'Elena Rostova',
    joindate: '2025-01-14',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'art-5',
    name: 'The Brass Collective',
    joindate: '2023-08-20',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'art-6',
    name: 'Synthetix 84',
    joindate: '2024-02-11',
    image: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'art-7',
    name: 'Maya & The Strings',
    joindate: '2024-07-03',
    image: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=500&q=80'
  },
  {
    id: 'art-8',
    name: 'DJ Solitude',
    joindate: '2023-05-19',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=500&q=80'
  }
];

export const INITIAL_FEATURED_PLAYLISTS: Playlist[] = [
  {
    id: 'feat-rnb',
    userId: 'admin-user-id',
    name: 'R&B Playlist',
    description: 'Chill your mind',
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    isFeatured: true,
    trackIds: ['mock-shape-of-you', 'mock-lonely', 'mock-baby', '1888998'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'feat-daily-mix-2',
    userId: 'admin-user-id',
    name: 'Daily Mix 2',
    description: 'Made for you',
    coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    isFeatured: true,
    trackIds: ['mock-alone', 'mock-shape-of-you', '1875421', '1821098'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'feat-pl-1',
    userId: 'admin-user-id',
    name: 'Jamendo Top 50 Hits 2026',
    description: 'The most streamed independent tracks on Jamendo this month.',
    coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    isFeatured: true,
    trackIds: ['1888998', '1875421', '1849900', '1821098'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'feat-pl-2',
    userId: 'admin-user-id',
    name: 'Late Night Coding Flow',
    description: 'Deep synthwave, ambient lofi and atmospheric electronic beats.',
    coverImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    isFeatured: true,
    trackIds: ['1888998', '1864320', '1849900', '1875421'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'feat-pl-3',
    userId: 'admin-user-id',
    name: 'Sunny Sunday Coffee',
    description: 'Acoustic guitar melodies, soulful vocals and gentle morning rhythms.',
    coverImage: 'https://images.unsplash.com/photo-1445985543470-41fba5c3144a?auto=format&fit=crop&w=600&q=80',
    isPublic: true,
    isFeatured: true,
    trackIds: ['1891234', '1832145', '1853210'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];
