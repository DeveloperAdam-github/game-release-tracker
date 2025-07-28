import React, { useState } from 'react';
import { Search, Filter, Calendar, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useGame } from '../contexts/GameContext';

// Available options based on RAWG API
const platforms = [
  'All Platforms',
  'PC',
  'PlayStation 5',
  'Xbox Series S/X',
  'Nintendo Switch',
  'PlayStation 4',
  'Xbox One',
  'iOS',
  'Android'
];

const genres = [
  'All Genres',
  'Action',
  'Adventure',
  'RPG',
  'Shooter',
  'Platformer',
  'Racing',
  'Sports',
  'Strategy',
  'Simulation',
  'Puzzle',
  'Arcade',
  'Fighting',
  'Casual',
  'Indie'
];

const sortOptions = [
  { value: 'released', label: 'Release Date' },
  { value: 'name', label: 'Name' },
  { value: '-rating', label: 'Rating (High to Low)' },
  { value: 'rating', label: 'Rating (Low to High)' },
  { value: '-metacritic', label: 'Metacritic Score' },
  { value: '-created', label: 'Recently Added' }
];

const GameFilters = ({ 
  searchTerm, 
  setSearchTerm, 
  selectedPlatform, 
  setSelectedPlatform,
  selectedGenre,
  setSelectedGenre,
  sortBy,
  setSortBy,
  dateRange,
  setDateRange,
  showFavoritesOnly,
  setShowFavoritesOnly
}) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const { 
    viewMode, 
    setViewMode, 
    filters, 
    updateFilters, 
    clearFilters, 
    isUpcomingMode,
    showFavoritesOnly: contextShowFavoritesOnly,
    setShowFavoritesOnly: contextSetShowFavoritesOnly,
    yearFilter,
    setYearFilter,
    loadUpcomingGames
  } = useGame();

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedPlatform('All Platforms');
    setSelectedGenre('All Genres');
    setSortBy('released');
    setDateRange({ start: '', end: '' });
    setShowFavoritesOnly(false);
    contextSetShowFavoritesOnly(false);
    clearFilters();
  };

  const handleFavoritesToggle = () => {
    const newValue = !contextShowFavoritesOnly;
    contextSetShowFavoritesOnly(newValue);
    if (setShowFavoritesOnly) {
      setShowFavoritesOnly(newValue);
    }
  };

  const handleYearChange = (year) => {
    setYearFilter(year);
    if (isUpcomingMode) {
      const daysAhead = year === 'both' ? 730 : year === '2026' ? 365 : 365;
      loadUpcomingGames(year);
    }
  };

  const hasActiveFilters = searchTerm || 
    selectedPlatform !== 'All Platforms' || 
    selectedGenre !== 'All Genres' ||
    dateRange?.start || 
    dateRange?.end ||
    showFavoritesOnly;

  return (
    <Card className="p-6 mb-8 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 shadow-xl">
      <div className="space-y-6">
        {/* Search and View Toggle */}
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search for games..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg focus:shadow-xl transition-all duration-300"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-12 px-4"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-12 px-4"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <SelectValue placeholder="Platform" />
            </SelectTrigger>
            <SelectContent>
              {platforms.map(platform => (
                <SelectItem key={platform} value={platform}>
                  {platform}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedGenre} onValueChange={setSelectedGenre}>
            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <SelectValue placeholder="Genre" />
            </SelectTrigger>
            <SelectContent>
              {genres.map(genre => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Release Date From
                </label>
                <Input
                  type="date"
                  value={dateRange?.start || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Release Date To
                </label>
                <Input
                  type="date"
                  value={dateRange?.end || ''}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Quick Actions
                </label>
                <div className="space-y-2">
                  <Button
                    variant={showFavoritesOnly ? 'default' : 'outline'}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className="w-full h-12 bg-white/80 backdrop-blur-sm border-0 shadow-lg"
                  >
                    ❤️ Favorites Only
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <>
            <Separator />
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active filters:
              </span>
              
              {searchTerm && (
                <Badge variant="secondary" className="animate-in fade-in duration-300">
                  Search: "{searchTerm}"
                </Badge>
              )}
              
              {selectedPlatform !== 'All Platforms' && (
                <Badge variant="secondary" className="animate-in fade-in duration-300">
                  Platform: {selectedPlatform}
                </Badge>
              )}
              
              {selectedGenre !== 'All Genres' && (
                <Badge variant="secondary" className="animate-in fade-in duration-300">
                  Genre: {selectedGenre}
                </Badge>
              )}
              
              {dateRange?.start && (
                <Badge variant="secondary" className="animate-in fade-in duration-300">
                  From: {dateRange.start}
                </Badge>
              )}
              
              {dateRange?.end && (
                <Badge variant="secondary" className="animate-in fade-in duration-300">
                  To: {dateRange.end}
                </Badge>
              )}
              
              {showFavoritesOnly && (
                <Badge variant="secondary" className="animate-in fade-in duration-300">
                  ❤️ Favorites Only
                </Badge>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="ml-auto hover:bg-red-100 hover:text-red-600 transition-colors duration-200"
              >
                <Filter className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default GameFilters;