import React, { createContext, useContext, useState, useEffect } from 'react';
import { gameAPI } from '../services/api';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [isUpcomingMode, setIsUpcomingMode] = useState(true); // Track if we're showing upcoming games
  const [filters, setFilters] = useState({
    search: '',
    platform: 'All Platforms',
    genre: 'All Genres',
    dates: '',
    ordering: 'released',
    page_size: 40,
    page: 1
  });

  // Only load games when filters actually change (not on initial load)
  useEffect(() => {
    // Don't auto-load on mount if we're in upcoming mode
    if (!isUpcomingMode) {
      loadGames();
    }
  }, [filters, isUpcomingMode]);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsUpcomingMode(false); // Switch out of upcoming mode
      
      const gameData = await gameAPI.getGames(filters);
      setGames(gameData || []);
    } catch (err) {
      setError('Failed to load games. Please try again.');
      console.error('Error loading games:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUpcomingGames = async (daysAhead = 365) => {
    try {
      setLoading(true);
      setError(null);
      setIsUpcomingMode(true); // Set upcoming mode
      
      const gameData = await gameAPI.getUpcomingGames(daysAhead);
      setGames(gameData || []);
    } catch (err) {
      setError('Failed to load upcoming games. Please try again.');
      console.error('Error loading upcoming games:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (gameId, gameName) => {
    try {
      const game = games.find(g => g.id === gameId);
      if (!game) return;

      if (game.is_favorite) {
        await gameAPI.removeFavorite(gameId);
      } else {
        await gameAPI.addFavorite(gameId, gameName);
      }

      // Update the game in the local state
      setGames(prevGames => 
        prevGames.map(g => 
          g.id === gameId 
            ? { ...g, is_favorite: !g.is_favorite }
            : g
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite. Please try again.');
    }
  };

  const vote = async (gameId, voteType) => {
    try {
      await gameAPI.voteGame(gameId, voteType);

      // Update the game in the local state
      setGames(prevGames => 
        prevGames.map(g => {
          if (g.id === gameId) {
            const updatedGame = { ...g };
            const currentVote = g.user_vote;
            
            if (currentVote === voteType) {
              // Remove vote
              updatedGame.user_vote = null;
              if (g.vote_stats) {
                if (voteType === 'upvote') {
                  updatedGame.vote_stats.upvotes = Math.max(0, g.vote_stats.upvotes - 1);
                } else {
                  updatedGame.vote_stats.downvotes = Math.max(0, g.vote_stats.downvotes - 1);
                }
                updatedGame.vote_stats.total_votes = updatedGame.vote_stats.upvotes + updatedGame.vote_stats.downvotes;
              }
            } else {
              // Add or change vote
              const prevVote = g.user_vote;
              updatedGame.user_vote = voteType;
              
              if (g.vote_stats) {
                if (prevVote === 'upvote') {
                  updatedGame.vote_stats.upvotes = Math.max(0, g.vote_stats.upvotes - 1);
                } else if (prevVote === 'downvote') {
                  updatedGame.vote_stats.downvotes = Math.max(0, g.vote_stats.downvotes - 1);
                }
                
                if (voteType === 'upvote') {
                  updatedGame.vote_stats.upvotes += 1;
                } else {
                  updatedGame.vote_stats.downvotes += 1;
                }
                updatedGame.vote_stats.total_votes = updatedGame.vote_stats.upvotes + updatedGame.vote_stats.downvotes;
              }
            }
            
            return updatedGame;
          }
          return g;
        })
      );
    } catch (err) {
      console.error('Error voting on game:', err);
      setError('Failed to record vote. Please try again.');
    }
  };

  const updateFilters = (newFilters) => {
    setIsUpcomingMode(false); // Switch out of upcoming mode when filtering
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to page 1 when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      platform: 'All Platforms',
      genre: 'All Genres',
      dates: '',
      ordering: 'released',
      page_size: 40,
      page: 1
    });
    // Don't change upcoming mode when clearing filters
  };

  // Helper functions for compatibility
  const isFavorite = (gameId) => {
    const game = games.find(g => g.id === gameId);
    return game ? game.is_favorite : false;
  };

  const getUserVote = (gameId) => {
    const game = games.find(g => g.id === gameId);
    return game ? game.user_vote : null;
  };

  const getVoteCount = (gameId, voteType) => {
    const game = games.find(g => g.id === gameId);
    if (!game || !game.vote_stats) return 0;
    
    return voteType === 'upvote' 
      ? game.vote_stats.upvotes 
      : game.vote_stats.downvotes;
  };

  const getFavoriteGames = () => {
    return games.filter(game => game.is_favorite);
  };

  const getUpcomingGamesCount = () => {
    const today = new Date();
    return games.filter(game => {
      if (!game.released) return false;
      const releaseDate = new Date(game.released);
      return releaseDate > today;
    }).length;
  };

  const getAverageRating = () => {
    const gamesWithRating = games.filter(game => game.rating && game.rating > 0);
    if (gamesWithRating.length === 0) return 0;
    
    const sum = gamesWithRating.reduce((acc, game) => acc + game.rating, 0);
    return (sum / gamesWithRating.length).toFixed(1);
  };

  const getTotalVotes = () => {
    return games.reduce((total, game) => {
      if (game.vote_stats) {
        return total + game.vote_stats.total_votes;
      }
      return total;
    }, 0);
  };

  const value = {
    // State
    games,
    loading,
    error,
    viewMode,
    filters,
    
    // Actions
    setViewMode,
    updateFilters,
    clearFilters,
    loadGames,
    loadUpcomingGames,
    toggleFavorite,
    vote,
    
    // Helper functions
    isFavorite,
    getUserVote,
    getVoteCount,
    getFavoriteGames,
    getUpcomingGamesCount,
    getAverageRating,
    getTotalVotes
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};