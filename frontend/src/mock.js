// Mock data for game release tracker
export const mockGames = [
  {
    id: 1,
    name: "The Elder Scrolls VI",
    background_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop",
    released: "2025-11-15",
    platforms: [
      { platform: { name: "PC" } },
      { platform: { name: "PlayStation 5" } },
      { platform: { name: "Xbox Series S/X" } }
    ],
    genres: [
      { name: "RPG" },
      { name: "Adventure" }
    ],
    metacritic: 95,
    description: "The highly anticipated sixth installment in the Elder Scrolls series promises to deliver an epic fantasy adventure.",
    rating: 4.8,
    ratings_count: 15420
  },
  {
    id: 2,
    name: "Cyberpunk 2078",
    background_image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop",
    released: "2025-09-22",
    platforms: [
      { platform: { name: "PC" } },
      { platform: { name: "PlayStation 5" } },
      { platform: { name: "Xbox Series S/X" } }
    ],
    genres: [
      { name: "Action" },
      { name: "RPG" },
      { name: "Sci-Fi" }
    ],
    metacritic: 88,
    description: "A futuristic open-world RPG set in a cyberpunk universe with enhanced AI and immersive gameplay.",
    rating: 4.2,
    ratings_count: 8930
  },
  {
    id: 3,
    name: "Super Mario Odyssey 2",
    background_image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=400&fit=crop",
    released: "2025-12-03",
    platforms: [
      { platform: { name: "Nintendo Switch" } }
    ],
    genres: [
      { name: "Platformer" },
      { name: "Adventure" }
    ],
    metacritic: 92,
    description: "Mario returns with new worlds to explore and innovative gameplay mechanics in this magical adventure.",
    rating: 4.7,
    ratings_count: 12350
  },
  {
    id: 4,
    name: "God of War: Ragnarök Legacy",
    background_image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    released: "2025-08-18",
    platforms: [
      { platform: { name: "PlayStation 5" } },
      { platform: { name: "PC" } }
    ],
    genres: [
      { name: "Action" },
      { name: "Adventure" }
    ],
    metacritic: 94,
    description: "Kratos and Atreus continue their mythological journey in this epic conclusion to the Norse saga.",
    rating: 4.9,
    ratings_count: 18670
  },
  {
    id: 5,
    name: "Halo Infinite: Echoes",
    background_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop",
    released: "2025-10-12",
    platforms: [
      { platform: { name: "Xbox Series S/X" } },
      { platform: { name: "PC" } }
    ],
    genres: [
      { name: "FPS" },
      { name: "Sci-Fi" }
    ],
    metacritic: 87,
    description: "Master Chief returns in this expansion featuring new multiplayer modes and campaign content.",
    rating: 4.3,
    ratings_count: 9840
  },
  {
    id: 6,
    name: "Breath of the Wild 3",
    background_image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop",
    released: "2025-07-25",
    platforms: [
      { platform: { name: "Nintendo Switch" } }
    ],
    genres: [
      { name: "Adventure" },
      { name: "Open World" }
    ],
    metacritic: 96,
    description: "Link embarks on a new adventure with revolutionary gameplay mechanics and stunning visuals.",
    rating: 4.8,
    ratings_count: 16230
  },
  {
    id: 7,
    name: "Assassin's Creed: Renaissance",
    background_image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    released: "2025-11-08",
    platforms: [
      { platform: { name: "PC" } },
      { platform: { name: "PlayStation 5" } },
      { platform: { name: "Xbox Series S/X" } }
    ],
    genres: [
      { name: "Action" },
      { name: "Adventure" },
      { name: "Historical" }
    ],
    metacritic: 85,
    description: "Experience the Italian Renaissance through the eyes of a new Assassin in this historical adventure.",
    rating: 4.1,
    ratings_count: 7420
  },
  {
    id: 8,
    name: "Spider-Man 3",
    background_image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop",
    released: "2025-09-15",
    platforms: [
      { platform: { name: "PlayStation 5" } },
      { platform: { name: "PC" } }
    ],
    genres: [
      { name: "Action" },
      { name: "Superhero" }
    ],
    metacritic: 91,
    description: "Swing through New York as Spider-Man in this thrilling continuation of the beloved series.",
    rating: 4.6,
    ratings_count: 13580
  }
];

export const platforms = [
  "All Platforms",
  "PC", 
  "PlayStation 5",
  "Xbox Series S/X",
  "Nintendo Switch",
  "Mobile"
];

export const genres = [
  "All Genres",
  "Action",
  "Adventure", 
  "RPG",
  "FPS",
  "Platformer",
  "Sci-Fi",
  "Historical",
  "Superhero",
  "Open World"
];

export const sortOptions = [
  { value: "release_date", label: "Release Date" },
  { value: "name", label: "Name" },
  { value: "rating", label: "Rating" },
  { value: "metacritic", label: "Metacritic Score" }
];