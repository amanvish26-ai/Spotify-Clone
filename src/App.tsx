/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, 
  Search, 
  Library, 
  Sparkles, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Heart, 
  MoreVertical, 
  ChevronDown, 
  Shuffle, 
  Repeat, 
  Share2, 
  ListMusic, 
  Smartphone,
  Bell,
  History,
  Settings,
  Plus,
  Search as SearchIcon,
  Grid,
  Mic2,
  Upload,
  Loader2,
  Video,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";

// --- Types ---

type Screen = 'home' | 'search' | 'library' | 'premium' | 'playlist';

interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: string;
  isDownloaded?: boolean;
  lyrics?: string[];
}

interface Playlist {
  id: string;
  title: string;
  description: string;
  image: string;
  tracks: Track[];
  isDownloaded?: boolean;
}

// --- Mock Data ---

const HINDI_ARTISTS = ['Arijit Singh', 'Pritam', 'A.R. Rahman', 'Shreya Ghoshal', 'Jubin Nautiyal', 'Neha Kakkar', 'Badshah', 'Diljit Dosanjh', 'Amit Trivedi', 'Vishal-Shekhar', 'Sunidhi Chauhan', 'Mohit Chauhan', 'Armaan Malik', 'Darshan Raval', 'Sidhu Moose Wala', 'Kishore Kumar', 'Lata Mangeshkar', 'Mohammed Rafi', 'Asha Bhosle', 'Udit Narayan', 'Kumar Sanu', 'Sonu Nigam', 'Shaan', 'KK'];
const HINDI_TITLES = ['Dil', 'Pyaar', 'Ishq', 'Mohabbat', 'Zindagi', 'Sanam', 'Yaara', 'Dosti', 'Raat', 'Din', 'Saath', 'Tum', 'Hum', 'Aap', 'Meri', 'Tera', 'Mera', 'Apna', 'Sapna', 'Yaadein', 'Khwaishein', 'Dhadkan', 'Saansein', 'Rooh', 'Jaan', 'Dilwale', 'Mastani', 'Deewani', 'Chahat', 'Junoon', 'Fida', 'Qurban', 'Sajda', 'Ibadat', 'Dua', 'Shukriya', 'Meherbaan', 'Humsafar', 'Raahi', 'Manzil', 'Safar', 'Musafir', 'Baarish', 'Sawan', 'Mausam', 'Hawa', 'Aasman', 'Zameen', 'Sitara', 'Chand', 'Suraj', 'Roshni', 'Andhera', 'Ujala', 'Khushi', 'Gham', 'Aansoo', 'Muskurahat', 'Hansna', 'Rona', 'Jeena', 'Marna', 'Wada', 'Kasme', 'Rasm', 'Riwaaz', 'Parampara', 'Pratishtha', 'Anushasan'];

const generateMockSongs = (count: number): Track[] => {
  const baseSongs: Track[] = [
    { id: '1', title: 'Kesariya', artist: 'Pritam, Arijit Singh', albumArt: 'https://images.unsplash.com/photo-1514525253361-bee8a4874093?w=400&h=400&fit=crop&q=80', duration: '4:28' },
    { id: '2', title: 'Raataan Lambiyan', artist: 'Tanishk Bagchi, Jubin Nautiyal', albumArt: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop&q=80', duration: '3:50' },
    { id: '3', title: 'Pasoori', artist: 'Shae Gill, Ali Sethi', albumArt: 'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=400&h=400&fit=crop&q=80', duration: '3:44' },
    { id: '4', title: 'Chaiyya Chaiyya', artist: 'A.R. Rahman, Sukhwinder Singh', albumArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop&q=80', duration: '6:54' },
    { id: '5', title: 'Tum Hi Ho', artist: 'Mithoon, Arijit Singh', albumArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop&q=80', duration: '4:22' },
    { id: '6', title: 'Dil Se Re', artist: 'A.R. Rahman', albumArt: 'https://images.unsplash.com/photo-1459749411177-042180ceea72?w=400&h=400&fit=crop&q=80', duration: '6:44' },
    { id: '7', title: 'Kun Faya Kun', artist: 'A.R. Rahman, Javed Ali', albumArt: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop&q=80', duration: '7:53' },
    { id: '8', title: 'Kabira', artist: 'Pritam, Tochi Raina', albumArt: 'https://images.unsplash.com/photo-1420161907993-e298993c47ff?w=400&h=400&fit=crop&q=80', duration: '3:43' },
    { id: '9', title: 'Agar Tum Saath Ho', artist: 'Alka Yagnik, Arijit Singh', albumArt: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop&q=80', duration: '5:41' },
    { id: '10', title: 'Zinda', artist: 'Shankar-Ehsaan-Loy', albumArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400&h=400&fit=crop&q=80', duration: '3:31' },
  ];

  const generated: Track[] = [...baseSongs];
  const albumArts = [
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745',
    'https://images.unsplash.com/photo-1493225255756-d9584f8606e9',
    'https://images.unsplash.com/photo-1514525253361-bee8a4874093',
    'https://images.unsplash.com/photo-1459749411177-042180ceea72',
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
    'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad',
    'https://images.unsplash.com/photo-1516280440614-37939bbacd81',
    'https://images.unsplash.com/photo-1420161907993-e298993c47ff',
    'https://images.unsplash.com/photo-1501386761578-eac5c94b800a',
    'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17'
  ];

  for (let i = 11; i <= count; i++) {
    const artist = HINDI_ARTISTS[Math.floor(Math.random() * HINDI_ARTISTS.length)];
    const title1 = HINDI_TITLES[Math.floor(Math.random() * HINDI_TITLES.length)];
    const title2 = HINDI_TITLES[Math.floor(Math.random() * HINDI_TITLES.length)];
    const albumArt = `${albumArts[Math.floor(Math.random() * albumArts.length)]}?w=400&h=400&fit=crop&sig=${i}`;
    
    generated.push({
      id: i.toString(),
      title: `${title1} ${title2}`,
      artist: artist,
      albumArt: albumArt,
      duration: `${Math.floor(Math.random() * 4) + 2}:${Math.floor(Math.random() * 50) + 10}`
    });
  }
  return generated;
};

const ALL_TRACKS: Track[] = generateMockSongs(10000);

const RECENTLY_PLAYED: Track[] = ALL_TRACKS.slice(0, 6);

const TOP_MIXES: Playlist[] = [
  {
    id: 'm1',
    title: 'Bollywood Hits',
    description: 'The biggest chartbusters from the heart of India.',
    image: 'https://images.unsplash.com/photo-1583433807166-3581bfc6728d?w=400&h=400&fit=crop',
    tracks: ALL_TRACKS
  },
  {
    id: 'm2',
    title: 'Indie India',
    description: 'Fresh sounds from the independent music scene.',
    image: 'https://images.unsplash.com/photo-1514525253361-bee8a4874093?w=400&h=400&fit=crop',
    tracks: [ALL_TRACKS[2], ALL_TRACKS[9]]
  },
  {
    id: 'm3',
    title: 'A.R. Rahman Essentials',
    description: 'Masterpieces from the Mozart of Madras.',
    image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=400&fit=crop',
    tracks: [ALL_TRACKS[3], ALL_TRACKS[5], ALL_TRACKS[6]]
  }
];

const CATEGORIES = [
  { name: 'Pop', color: 'from-pink-500 to-rose-600' },
  { name: 'Indie', color: 'from-emerald-500 to-teal-700' },
  { name: 'Electronic', color: 'from-blue-600 to-indigo-800' },
  { name: 'Rock', color: 'from-orange-500 to-red-600' },
  { name: 'Hip-Hop', color: 'from-amber-400 to-yellow-600' },
  { name: 'Mood', color: 'from-purple-500 to-indigo-600' },
  { name: 'New Releases', color: 'from-cyan-400 to-blue-500' },
  { name: 'Podcasts', color: 'from-slate-600 to-slate-800' }
];

const LIBRARY_ITEMS = [
  { id: 'l1', title: 'Liked Songs', type: 'Playlist', count: '1,248 songs', icon: <Heart className="fill-white" /> },
  { id: 'l2', title: 'Your Top Mixes', type: 'Playlist', count: 'Made for you', image: 'https://picsum.photos/seed/mix/100/100' },
  { id: 'l3', title: 'New Episodes', type: 'Podcast', count: 'Updated 2 days ago', icon: <Bell className="text-emerald-400" /> },
  { id: 'l4', title: 'The Midnight', type: 'Artist', count: '', image: 'https://picsum.photos/seed/midnight/100/100' },
  { id: 'l5', title: 'Lofi Girl', type: 'Artist', count: '', image: 'https://picsum.photos/seed/lofi/100/100' },
  { id: 'l6', title: 'Late Night Vibes', type: 'Playlist', count: 'You', image: 'https://picsum.photos/seed/vibes/100/100' },
  { id: 'l7', title: 'Techno Essentials', type: 'Playlist', count: 'Auralis', image: 'https://picsum.photos/seed/essentials/100/100' }
];

// --- Components ---

const BottomNav = ({ currentScreen, setScreen }: { currentScreen: Screen, setScreen: (s: Screen) => void }) => {
  const navItems: { id: Screen, label: string, icon: any }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'premium', label: 'Premium', icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-base/95 border-t border-bg-highlight px-4 pb-8 pt-3 backdrop-blur-md flex items-center justify-around">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setScreen(item.id)}
          className={`flex flex-col items-center gap-1 transition-colors ${currentScreen === item.id ? 'text-brand' : 'text-text-secondary hover:text-text-primary'}`}
        >
          <item.icon size={24} fill={currentScreen === item.id ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const MiniPlayer = ({ track, isPlaying, onTogglePlay, onOpenFull }: { track: Track, isPlaying: boolean, onTogglePlay: () => void, onOpenFull: () => void }) => {
  return (
    <div className="fixed bottom-24 left-2 right-2 z-40">
      <div className="p-2 bg-bg-elevated border border-bg-highlight rounded-lg flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={onOpenFull}>
          <div className="w-10 h-10 rounded bg-brand/20 overflow-hidden">
            <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold truncate">{track.title}</span>
            <span className="text-[10px] text-text-secondary truncate">{track.artist}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 px-2">
          <Smartphone size={20} className="text-text-secondary hover:text-text-primary cursor-pointer" />
          <button onClick={onTogglePlay} className="text-text-primary">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Screens ---

const HomeScreen = ({ onPlayTrack, onOpenPlaylist }: { onPlayTrack: (t: Track) => void, onOpenPlaylist: (p: Playlist) => void }) => {
  return (
    <div className="px-4 pt-8 pb-40">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Good evening</h1>
        <div className="flex gap-4">
          <Bell size={24} className="text-text-primary cursor-pointer" />
          <History size={24} className="text-text-primary cursor-pointer" />
          <Settings size={24} className="text-text-primary cursor-pointer" />
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 mb-8">
        {RECENTLY_PLAYED.slice(0, 6).map((track) => (
          <div 
            key={track.id} 
            onClick={() => onPlayTrack(track)}
            className="bg-bg-elevated/40 rounded-md overflow-hidden flex items-center gap-3 cursor-pointer hover:bg-bg-highlight/60 transition-colors"
          >
            <div className="w-14 h-14 shrink-0">
              <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
            </div>
            <span className="text-sm font-bold truncate pr-2">{track.title}</span>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recently Played</h2>
          <button className="text-brand text-sm font-bold">Show all</button>
        </div>
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
          {RECENTLY_PLAYED.map((track) => (
            <div key={track.id} className="shrink-0 w-40 cursor-pointer" onClick={() => onPlayTrack(track)}>
              <div className="aspect-square rounded-xl overflow-hidden mb-3">
                <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-sm font-bold truncate">{track.title}</h3>
              <p className="text-xs text-text-secondary truncate">{track.artist}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Your Top Mixes</h2>
        <div className="flex gap-4 overflow-x-auto custom-scrollbar pb-2">
          {TOP_MIXES.map((mix) => (
            <div 
              key={mix.id} 
              onClick={() => onOpenPlaylist(mix)}
              className="shrink-0 w-48 bg-bg-elevated/40 p-3 rounded-xl border border-bg-highlight/50 cursor-pointer hover:bg-bg-highlight/20 transition-colors"
            >
              <div className="aspect-square rounded-lg overflow-hidden mb-4">
                <img src={mix.image} alt={mix.title} className="w-full h-full object-cover" />
              </div>
              <h3 className="text-sm font-bold mb-1">{mix.title}</h3>
              <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">{mix.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const SearchScreen = ({ onPlayTrack }: { onPlayTrack: (t: Track) => void }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim()) {
      const filtered = ALL_TRACKS.filter(t => 
        t.title.toLowerCase().includes(val.toLowerCase()) || 
        t.artist.toLowerCase().includes(val.toLowerCase())
      );
      setResults(filtered);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="px-4 pt-8 pb-40">
      <h1 className="text-3xl font-bold mb-6">Search</h1>
      <div className="relative mb-8">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <SearchIcon size={20} className="text-text-secondary" />
        </div>
        <input 
          type="text" 
          value={query}
          onChange={handleSearch}
          placeholder="What do you want to listen to?" 
          className="w-full pl-12 pr-4 py-3 bg-bg-elevated/50 border-none rounded-lg text-text-primary placeholder-text-secondary focus:ring-2 focus:ring-brand transition-all"
        />
      </div>

      {query.trim() ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Top results</h2>
          {results.length > 0 ? (
            results.map((track) => (
              <div 
                key={track.id} 
                onClick={() => onPlayTrack(track)}
                className="flex items-center gap-4 p-2 rounded-lg hover:bg-bg-highlight/20 cursor-pointer transition-colors group"
              >
                <div className="w-14 h-14 rounded overflow-hidden shrink-0 shadow-lg">
                  <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <h3 className="font-bold text-sm truncate group-hover:text-brand transition-colors">{track.title}</h3>
                  <p className="text-xs text-text-secondary truncate">{track.artist}</p>
                </div>
                <div className="text-xs text-text-secondary font-mono">{track.duration}</div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <p className="text-text-secondary">No results found for "{query}"</p>
            </div>
          )}
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Browse all</h2>
          <div className="grid grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => (
              <div key={cat.name} className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer bg-gradient-to-br ${cat.color} p-4`}>
                <span className="text-white font-bold text-lg">{cat.name}</span>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 rotate-12 opacity-80 bg-white/20 blur-xl rounded-full"></div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const LibraryScreen = ({ onPlayTrack }: { onPlayTrack: (t: Track) => void }) => {
  const filters = ['Playlists', 'Artists', 'Albums', 'Podcasts', 'Downloaded'];
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [hasExported, setHasExported] = useState(false);

  const handleExportAll = () => {
    setIsExporting(true);
    setExportProgress(0);
    const interval = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setHasExported(true);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  return (
    <div className="px-4 pt-8 pb-40">
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-bg-elevated overflow-hidden">
            <img src="https://picsum.photos/seed/user/100/100" alt="Profile" />
          </div>
          <h1 className="text-2xl font-bold">Your Library</h1>
        </div>
        <div className="flex gap-4">
          <SearchIcon size={24} className="text-text-primary" />
          <Plus size={24} className="text-text-primary" />
        </div>
      </header>

      <div className="flex gap-2 mb-8 overflow-x-auto custom-scrollbar pb-2">
        {filters.map((f, i) => (
          <button 
            key={f} 
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${i === 0 ? 'bg-brand text-white' : 'bg-bg-elevated text-text-primary'}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Export Online Songs Section */}
      <div className="mb-8 p-4 bg-brand/10 rounded-xl border border-brand/20">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-brand">
            <ExternalLink size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">Online Catalog</span>
          </div>
          {hasExported && <span className="text-[10px] font-bold text-brand bg-brand/20 px-2 py-0.5 rounded">EXPORTED</span>}
        </div>
        <h3 className="font-bold mb-1">Export All Online Songs</h3>
        <p className="text-xs text-text-secondary mb-4">Save the entire Auralis online catalog to your local device for offline listening.</p>
        
        {isExporting ? (
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-bg-highlight rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-brand" 
                initial={{ width: 0 }}
                animate={{ width: `${exportProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-bold text-text-secondary">
              <span>EXPORTING CATALOG...</span>
              <span>{exportProgress}%</span>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleExportAll}
            className="w-full py-2 bg-brand text-bg-base rounded-lg font-bold text-sm hover:scale-[1.02] transition-transform"
          >
            {hasExported ? 'Update Exported Catalog' : 'Export All Songs'}
          </button>
        )}
      </div>

      <div className="flex items-center justify-between mb-6 text-xs font-bold text-text-secondary uppercase tracking-wider">
        <div className="flex items-center gap-2">
          <Shuffle size={14} />
          <span>Recents</span>
        </div>
        <Grid size={16} />
      </div>

      <div className="space-y-4">
        {hasExported && (
          <div className="mb-6">
            <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Exported Online Songs</h3>
            <div className="space-y-4">
              {ALL_TRACKS.map((track) => (
                <div key={`exp-${track.id}`} onClick={() => onPlayTrack(track)} className="flex items-center gap-4 cursor-pointer group">
                  <div className="w-12 h-12 rounded overflow-hidden">
                    <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col flex-1">
                    <h4 className="font-bold text-sm group-hover:text-brand transition-colors">{track.title}</h4>
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-brand flex items-center justify-center"><Plus size={8} className="text-bg-base rotate-45" /></div>
                      <p className="text-xs text-text-secondary">{track.artist}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-xs font-bold text-text-secondary uppercase tracking-widest mb-4">Your Collections</h3>
        {LIBRARY_ITEMS.map((item) => (
          <div key={item.id} className="flex items-center gap-4 cursor-pointer group">
            <div className={`w-16 h-16 rounded-md overflow-hidden flex items-center justify-center ${item.image ? '' : 'bg-gradient-to-br from-brand to-brand-dark'}`}>
              {item.image ? (
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                item.icon
              )}
            </div>
            <div className="flex flex-col">
              <h3 className="font-bold group-hover:text-brand transition-colors">{item.title}</h3>
              <p className="text-xs text-text-secondary">{item.type} • {item.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NowPlayingScreen = ({ track, isPlaying, onTogglePlay, onClose }: { track: Track, isPlaying: boolean, onTogglePlay: () => void, onClose: () => void }) => {
  return (
    <motion.div 
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-[60] bg-bg-base flex flex-col"
    >
      <header className="flex items-center justify-between p-6">
        <button onClick={onClose} className="size-10 rounded-full hover:bg-white/10 flex items-center justify-center">
          <ChevronDown size={32} />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[10px] uppercase tracking-widest text-text-secondary font-bold">Playing from Playlist</span>
          <h2 className="text-sm font-semibold">Midnight Electronic</h2>
        </div>
        <button className="size-10 rounded-full hover:bg-white/10 flex items-center justify-center">
          <MoreVertical size={24} />
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-full max-w-md aspect-square mb-12 shadow-2xl shadow-black/50 rounded-xl overflow-hidden">
          <img src={track.albumArt} alt={track.title} className="w-full h-full object-cover" />
        </div>

        <div className="w-full max-w-md flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight mb-1">{track.title}</h1>
            <p className="text-lg font-medium text-text-secondary">{track.artist}</p>
          </div>
          <Heart size={32} className="text-text-primary hover:text-brand transition-colors cursor-pointer" />
        </div>

        <div className="w-full max-w-md mb-10">
          <div className="relative h-1.5 w-full bg-text-primary/20 rounded-full overflow-hidden mb-2">
            <div className="absolute top-0 left-0 h-full bg-brand rounded-full" style={{ width: '38%' }}></div>
          </div>
          <div className="flex justify-between text-xs font-medium text-text-secondary">
            <span>1:42</span>
            <span>{track.duration}</span>
          </div>
        </div>

        <div className="w-full max-w-md flex items-center justify-between mb-12">
          <Shuffle size={24} className="text-text-secondary hover:text-brand cursor-pointer" />
          <div className="flex items-center gap-8">
            <SkipBack size={48} className="text-text-primary hover:text-brand cursor-pointer" />
            <button 
              onClick={onTogglePlay}
              className="size-20 rounded-full bg-text-primary text-bg-base flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-1" />}
            </button>
            <SkipForward size={48} className="text-text-primary hover:text-brand cursor-pointer" />
          </div>
          <Repeat size={24} className="text-text-secondary hover:text-brand cursor-pointer" />
        </div>

        <div className="w-full max-w-md flex items-center justify-between px-2">
          <Smartphone size={20} className="text-text-secondary hover:text-text-primary cursor-pointer" />
          <div className="flex gap-6">
            <Share2 size={20} className="text-text-secondary hover:text-text-primary cursor-pointer" />
            <ListMusic size={20} className="text-text-secondary hover:text-text-primary cursor-pointer" />
          </div>
        </div>
      </main>

      <div className="mt-8 px-6 pb-12 w-full max-w-md mx-auto">
        <div className="bg-bg-elevated border border-white/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold">Lyrics</h3>
            <button className="bg-white/10 hover:bg-white/20 rounded-full px-3 py-1 text-xs font-bold">MORE</button>
          </div>
          <div className="space-y-4">
            <p className="text-xl font-bold text-text-primary line-clamp-1">Tracing light through the silicon veins</p>
            <p className="text-xl font-bold text-white/40 line-clamp-1">Where the electric pulse remains</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VeoScreen = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateVideo = async () => {
    if (!image) return;

    try {
      // Check for API key
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        return;
      }

      setIsGenerating(true);
      setStatus('Initializing Veo...');
      setVideoUrl(null);

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = image.split(',')[1];

      setStatus('Starting video generation...');
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: 'Animate this image with cinematic motion, subtle lighting changes, and high quality details.',
        image: {
          imageBytes: base64Data,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: aspectRatio
        }
      });

      // Polling
      while (!operation.done) {
        setStatus('Generating video... this may take a few minutes.');
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setStatus('Fetching video...');
        const response = await fetch(downloadLink, {
          method: 'GET',
          headers: {
            'x-goog-api-key': process.env.GEMINI_API_KEY!,
          },
        });
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
        setStatus('Generation complete!');
      }
    } catch (error: any) {
      console.error('Veo Error:', error);
      setStatus(`Error: ${error.message || 'Failed to generate video'}`);
      if (error.message?.includes('Requested entity was not found')) {
        await (window as any).aistudio.openSelectKey();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="px-4 pt-8 pb-40">
      <header className="mb-8">
        <div className="flex items-center gap-2 text-brand mb-2">
          <Sparkles size={24} />
          <span className="font-bold uppercase tracking-widest text-xs">Premium Feature</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Animate with Veo</h1>
        <p className="text-text-secondary">Transform your favorite album art or photos into cinematic videos using AI.</p>
      </header>

      <div className="space-y-6">
        {/* Upload Area */}
        <div 
          onClick={() => !isGenerating && fileInputRef.current?.click()}
          className={`relative aspect-video rounded-2xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${image ? 'border-brand/50' : 'border-bg-highlight hover:border-brand/30 bg-bg-elevated/40'}`}
        >
          {image ? (
            <img src={image} alt="Upload preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <Upload size={48} className="text-text-disabled mb-4" />
              <p className="text-text-secondary font-medium">Click to upload a photo</p>
              <p className="text-text-disabled text-sm">PNG, JPG up to 10MB</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            accept="image/*" 
            className="hidden" 
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-text-secondary">Aspect Ratio</span>
            <div className="flex gap-2">
              {(['16:9', '9:16'] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${aspectRatio === ratio ? 'bg-brand text-white' : 'bg-bg-elevated text-text-secondary'}`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateVideo}
            disabled={!image || isGenerating}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${!image || isGenerating ? 'bg-bg-elevated text-text-disabled cursor-not-allowed' : 'bg-brand text-white hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-brand/20'}`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Video size={20} />
                <span>Generate Video</span>
              </>
            )}
          </button>
        </div>

        {/* Status & Result */}
        <AnimatePresence>
          {(status || videoUrl) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {status && (
                <div className="p-4 bg-bg-elevated/60 rounded-xl border border-bg-highlight flex items-center gap-3">
                  {isGenerating && <Loader2 className="animate-spin text-brand" size={18} />}
                  <p className="text-sm text-text-secondary">{status}</p>
                </div>
              )}

              {videoUrl && (
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden bg-black shadow-2xl">
                    <video 
                      src={videoUrl} 
                      controls 
                      autoPlay 
                      loop 
                      className={`w-full ${aspectRatio === '9:16' ? 'aspect-[9/16]' : 'aspect-video'}`}
                    />
                  </div>
                  <div className="flex gap-3">
                    <a 
                      href={videoUrl} 
                      download="auralis-veo-video.mp4"
                      className="flex-1 py-3 bg-text-primary text-bg-base rounded-xl font-bold text-center flex items-center justify-center gap-2"
                    >
                      Download Video
                    </a>
                    <button 
                      onClick={() => { setImage(null); setVideoUrl(null); setStatus(''); }}
                      className="px-6 py-3 bg-bg-elevated text-text-primary rounded-xl font-bold"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-6 bg-brand/5 rounded-2xl border border-brand/10">
          <div className="flex items-center gap-2 mb-2 text-brand">
            <ExternalLink size={16} />
            <span className="text-xs font-bold uppercase">Billing Information</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Veo video generation requires a paid Google Cloud project with billing enabled. 
            Learn more at <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline text-brand">ai.google.dev/gemini-api/docs/billing</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

const PlaylistScreen = ({ playlist, onPlayTrack, onBack }: { playlist: Playlist, onPlayTrack: (t: Track) => void, onBack: () => void }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloaded, setIsDownloaded] = useState(playlist.isDownloaded || false);

  const handleDownload = () => {
    if (isDownloaded) {
      setIsDownloaded(false);
      return;
    }
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setIsDownloaded(true);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  return (
    <div className="min-h-screen pb-40">
      <header className="relative h-80 flex flex-col justify-end p-6 bg-gradient-to-b from-brand/40 to-bg-base">
        <button onClick={onBack} className="absolute top-8 left-6 size-10 rounded-full bg-black/40 flex items-center justify-center">
          <ChevronDown className="rotate-90" size={24} />
        </button>
        
        <div className="flex gap-6 items-end">
          <div className="w-48 h-48 shadow-2xl rounded-lg overflow-hidden shrink-0">
            <img src={playlist.image} alt={playlist.title} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Playlist</span>
            <h1 className="text-4xl font-bold tracking-tight">{playlist.title}</h1>
            <p className="text-sm text-text-secondary line-clamp-2">{playlist.description}</p>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center text-[10px] font-bold">A</div>
              <span className="text-xs font-bold">Auralis • {playlist.tracks.length} songs</span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={handleDownload}
            className={`flex items-center justify-center transition-colors ${isDownloaded ? 'text-brand' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {isDownloading ? (
              <div className="relative size-6">
                <svg className="size-full -rotate-90">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="62.8" strokeDashoffset={62.8 - (62.8 * downloadProgress) / 100} />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="size-1 bg-brand rounded-full animate-pulse" />
                </div>
              </div>
            ) : (
              <div className={`size-6 rounded-full border-2 flex items-center justify-center ${isDownloaded ? 'bg-brand border-brand text-bg-base' : 'border-text-secondary'}`}>
                <Plus size={14} className={isDownloaded ? 'rotate-45' : ''} />
              </div>
            )}
          </button>
          <MoreVertical size={24} className="text-text-secondary" />
        </div>
        
        <div className="flex items-center gap-4">
          <Shuffle size={24} className="text-text-secondary" />
          <button className="size-14 rounded-full bg-brand text-bg-base flex items-center justify-center hover:scale-105 transition-transform">
            <Play size={28} fill="currentColor" className="ml-1" />
          </button>
        </div>
      </div>

      <div className="px-6 space-y-6">
        {playlist.tracks.map((track, i) => (
          <div 
            key={track.id} 
            onClick={() => onPlayTrack(track)}
            className="flex items-center justify-between group cursor-pointer"
          >
            <div className="flex items-center gap-4 flex-1 overflow-hidden">
              <span className="text-sm font-medium text-text-secondary w-4">{i + 1}</span>
              <div className="flex flex-col overflow-hidden">
                <h3 className="font-bold truncate group-hover:text-brand transition-colors">{track.title}</h3>
                <div className="flex items-center gap-2">
                  {isDownloaded && <div className="size-3 rounded-full bg-brand flex items-center justify-center"><Plus size={8} className="text-bg-base rotate-45" /></div>}
                  <p className="text-xs text-text-secondary truncate">{track.artist}</p>
                </div>
              </div>
            </div>
            <MoreVertical size={20} className="text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [currentScreen, setScreen] = useState<Screen>('home');
  const [currentTrack, setCurrentTrack] = useState<Track>(ALL_TRACKS[0]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullPlayerOpen, setIsFullPlayerOpen] = useState(false);

  const handlePlayTrack = (track: Track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const handleOpenPlaylist = (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setScreen('playlist');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home': return <HomeScreen onPlayTrack={handlePlayTrack} onOpenPlaylist={handleOpenPlaylist} />;
      case 'search': return <SearchScreen onPlayTrack={handlePlayTrack} />;
      case 'library': return <LibraryScreen onPlayTrack={handlePlayTrack} />;
      case 'premium': return <VeoScreen />;
      case 'playlist': return selectedPlaylist ? <PlaylistScreen playlist={selectedPlaylist} onPlayTrack={handlePlayTrack} onBack={() => setScreen('home')} /> : null;
      default: return <HomeScreen onPlayTrack={handlePlayTrack} onOpenPlaylist={handleOpenPlaylist} />;
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-text-primary selection:bg-brand/30">
      {/* Main Content */}
      <main className="max-w-md mx-auto min-h-screen relative">
        {renderScreen()}
      </main>

      {/* Persistent UI */}
      <MiniPlayer 
        track={currentTrack} 
        isPlaying={isPlaying} 
        onTogglePlay={() => setIsPlaying(!isPlaying)} 
        onOpenFull={() => setIsFullPlayerOpen(true)}
      />
      
      <BottomNav currentScreen={currentScreen} setScreen={setScreen} />

      {/* Full Player Overlay */}
      <AnimatePresence>
        {isFullPlayerOpen && (
          <NowPlayingScreen 
            track={currentTrack} 
            isPlaying={isPlaying} 
            onTogglePlay={() => setIsPlaying(!isPlaying)} 
            onClose={() => setIsFullPlayerOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
