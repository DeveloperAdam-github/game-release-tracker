import React, { useState, useEffect } from 'react';
import { Gamepad2, TrendingUp, Calendar, Users, Sparkles, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import GameCard from './GameCard';
import GameFilters from './GameFilters';
import { useGame } from '../contexts/GameContext';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';

const GameDashboard = () => {
  const {
    games,
    loading,
    error,
    viewMode,
    filters,
    isUpcomingMode,
    updateFilters,
    clearFilters,
    loadUpcomingGames,
    getFavoriteGames,
    getUpcomingGamesCount,
    getAverageRating,
    getTotalVotes
  } = useGame();

  const [initialized, setInitialized] = useState(false);

  // Load upcoming games only once on component mount
  useEffect(() => {
    if (!initialized) {
      loadUpcomingGames(365);
      setInitialized(true);
    }
  }, [initialized, loadUpcomingGames]);

  const handleRetry = () => {
    loadUpcomingGames(365);
  };

  const upcomingCount = getUpcomingGamesCount();
  const avgRating = getAverageRating();
  const totalVotes = getTotalVotes();
  const favoriteCount = getFavoriteGames().length;

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
              Discover and track the most anticipated upcoming game releases from RAWG
            </p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-80" />
              <p className="text-2xl font-bold">{upcomingCount}</p>
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
              <p className="text-2xl font-bold">{favoriteCount}</p>
              <p className="text-red-100 text-sm">Your Favorites</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <GameFilters
          searchTerm={filters.search}
          setSearchTerm={(search) => updateFilters({ search })}
          selectedPlatform={filters.platform}
          setSelectedPlatform={(platform) => updateFilters({ platform })}
          selectedGenre={filters.genre}
          setSelectedGenre={(genre) => updateFilters({ genre })}
          sortBy={filters.ordering}
          setSortBy={(ordering) => updateFilters({ ordering })}
          dateRange={filters.dates ? { 
            start: filters.dates.split(',')[0] || '', 
            end: filters.dates.split(',')[1] || '' 
          } : { start: '', end: '' }}
          setDateRange={(range) => {
            const dates = range.start && range.end ? `${range.start},${range.end}` : '';
            updateFilters({ dates });
          }}
          showFavoritesOnly={false}
          setShowFavoritesOnly={() => {}} // We'll handle this differently with API
        />

        {/* Error State */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="ml-2 h-6 text-xs"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-lg text-gray-600 dark:text-gray-400">Loading games...</p>
            </div>
          </div>
        )}

        {/* Results Header */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isUpcomingMode ? 'Upcoming Games' : 'Game Releases'}
              </h2>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {games.length} games
              </Badge>
            </div>
            
            {games.length === 0 && !loading && (
              <div className="text-gray-500 dark:text-gray-400 italic">
                No games match your current filters
              </div>
            )}
          </div>
        )}

        {/* Games Grid/List */}
        {!loading && games.length > 0 ? (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
              : 'space-y-4'
          } animate-in fade-in duration-500`}>
            {games.map((game, index) => (
              <div
                key={game.id}
                className="animate-in slide-in-from-bottom duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <GameCard game={game} viewMode={viewMode} />
              </div>
            ))}
          </div>
        ) : !loading && games.length === 0 && !error ? (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border-0">
            <Gamepad2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
              No games found
            </h3>
            <p className="text-gray-500 dark:text-gray-500 mb-4">
              Try adjusting your filters to discover more games
            </p>
            <Button onClick={() => clearFilters()} variant="outline">
              Clear All Filters
            </Button>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default GameDashboard;