import React, { useState, useMemo } from 'react';
import { Gamepad2, TrendingUp, Calendar, Users, Sparkles } from 'lucide-react';
import GameCard from './GameCard';
import GameFilters from './GameFilters';
import { useGame } from '../contexts/GameContext';
import { mockGames } from '../mock';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';

const GameDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('All Platforms');
  const [selectedGenre, setSelectedGenre] = useState('All Genres');
  const [sortBy, setSortBy] = useState('release_date');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  const { viewMode, favorites, isFavorite } = useGame();

  const filteredAndSortedGames = useMemo(() => {
    let filtered = mockGames.filter((game) => {
      const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlatform = selectedPlatform === 'All Platforms' || 
        game.platforms.some(p => p.platform.name === selectedPlatform);
      const matchesGenre = selectedGenre === 'All Genres' || 
        game.genres.some(g => g.name === selectedGenre);
      const matchesFavorites = !showFavoritesOnly || isFavorite(game.id);
      
      let matchesDateRange = true;
      if (dateRange.start || dateRange.end) {
        const gameDate = new Date(game.released);
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date('1900-01-01');
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date('2100-12-31');
        matchesDateRange = gameDate >= startDate && gameDate <= endDate;
      }
      
      return matchesSearch && matchesPlatform && matchesGenre && matchesFavorites && matchesDateRange;
    });

    // Sort games
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'metacritic':
          return (b.metacritic || 0) - (a.metacritic || 0);
        case 'release_date':
        default:
          return new Date(a.released) - new Date(b.released);
      }
    });

    return filtered;
  }, [searchTerm, selectedPlatform, selectedGenre, sortBy, dateRange, showFavoritesOnly, isFavorite]);

  const upcomingGames = mockGames.filter(game => new Date(game.released) > new Date());
  const totalVotes = mockGames.length * 150; // Mock total votes
  const avgRating = (mockGames.reduce((sum, game) => sum + (game.rating || 0), 0) / mockGames.length).toFixed(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-5 blur-3xl"></div>
          <div className="relative">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-lg">
                <Gamepad2 className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                GameTracker
              </h1>
              <Sparkles className="h-8 w-8 text-purple-500 animate-pulse" />
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover and track the most anticipated upcoming game releases
            </p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-2xl font-bold">{upcomingGames.length}</p>
              <p className="text-blue-100 text-sm">Upcoming Games</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-2xl font-bold">{avgRating}</p>
              <p className="text-purple-100 text-sm">Avg Rating</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-2xl font-bold">{totalVotes.toLocaleString()}</p>
              <p className="text-green-100 text-sm">Total Votes</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-red-500 to-pink-500 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <Gamepad2 className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-2xl font-bold">{favorites.length}</p>
              <p className="text-red-100 text-sm">Your Favorites</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <GameFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedPlatform={selectedPlatform}
          setSelectedPlatform={setSelectedPlatform}
          selectedGenre={selectedGenre}
          setSelectedGenre={setSelectedGenre}
          sortBy={sortBy}
          setSortBy={setSortBy}
          dateRange={dateRange}
          setDateRange={setDateRange}
          showFavoritesOnly={showFavoritesOnly}
          setShowFavoritesOnly={setShowFavoritesOnly}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Game Releases
            </h2>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {filteredAndSortedGames.length} games
            </Badge>
          </div>
          
          {filteredAndSortedGames.length === 0 && (
            <div className="text-gray-500 dark:text-gray-400 italic">
              No games match your current filters
            </div>
          )}
        </div>

        {/* Games Grid/List */}
        {filteredAndSortedGames.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          } animate-in fade-in duration-500`}>
            {filteredAndSortedGames.map((game, index) => (
              <div
                key={game.id}
                className="animate-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <GameCard game={game} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-0">
            <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No games found
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              Try adjusting your filters to discover more games
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GameDashboard;