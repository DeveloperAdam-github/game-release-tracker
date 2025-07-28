import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API,
  timeout: 30000,
});

// Get user ID from localStorage or generate one
const getUserId = () => {
  let userId = localStorage.getItem('gameTrackerUserId');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('gameTrackerUserId', userId);
  }
  return userId;
};

// Game API functions
export const gameAPI = {
  // Get games with filters
  async getGames(filters = {}) {
    try {
      const params = {
        user_id: getUserId(),
        ...filters
      };
      
      const response = await api.get('/games', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching games:', error);
      throw error;
    }
  },

  // Get upcoming games
  async getUpcomingGames(daysAhead = 365) {
    try {
      const params = {
        user_id: getUserId(),
        days_ahead: daysAhead
      };
      
      const response = await api.get('/games/upcoming', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming games:', error);
      throw error;
    }
  },

  // Add game to favorites
  async addFavorite(gameId, gameName) {
    try {
      const response = await api.post('/favorites', {
        user_id: getUserId(),
        game_id: gameId,
        game_name: gameName
      });
      return response.data;
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  },

  // Remove game from favorites
  async removeFavorite(gameId) {
    try {
      const response = await api.delete(`/favorites/${gameId}`, {
        params: { user_id: getUserId() }
      });
      return response.data;
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  },

  // Get user favorites
  async getFavorites() {
    try {
      const response = await api.get('/favorites', {
        params: { user_id: getUserId() }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching favorites:', error);
      throw error;
    }
  },

  // Vote on a game
  async voteGame(gameId, voteType) {
    try {
      const response = await api.post('/votes', {
        user_id: getUserId(),
        game_id: gameId,
        vote_type: voteType
      });
      return response.data;
    } catch (error) {
      console.error('Error voting on game:', error);
      throw error;
    }
  },

  // Get game statistics
  async getGameStats(gameId) {
    try {
      const response = await api.get(`/games/${gameId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching game stats:', error);
      throw error;
    }
  }
};

export default api;