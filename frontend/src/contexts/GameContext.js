import React, { createContext, useContext, useState, useEffect } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [votes, setVotes] = useState({});
  const [viewMode, setViewMode] = useState('grid');

  // Load data from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('gameFavorites');
    const savedVotes = localStorage.getItem('gameVotes');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    if (savedVotes) {
      setVotes(JSON.parse(savedVotes));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('gameFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save votes to localStorage
  useEffect(() => {
    localStorage.setItem('gameVotes', JSON.stringify(votes));
  }, [votes]);

  const toggleFavorite = (gameId) => {
    setFavorites(prev => {
      if (prev.includes(gameId)) {
        return prev.filter(id => id !== gameId);
      } else {
        return [...prev, gameId];
      }
    });
  };

  const vote = (gameId, voteType) => {
    setVotes(prev => ({
      ...prev,
      [gameId]: voteType
    }));
  };

  const getVoteCount = (gameId, voteType) => {
    // Mock vote counts for demonstration
    const baseCounts = {
      upvotes: Math.floor(Math.random() * 1000) + 100,
      downvotes: Math.floor(Math.random() * 200) + 10
    };
    
    const currentVote = votes[gameId];
    if (currentVote === voteType) {
      return baseCounts[voteType + 's'] + 1;
    }
    return baseCounts[voteType + 's'];
  };

  const isFavorite = (gameId) => favorites.includes(gameId);
  const getUserVote = (gameId) => votes[gameId] || null;

  const value = {
    favorites,
    votes,
    viewMode,
    setViewMode,
    toggleFavorite,
    vote,
    getVoteCount,
    isFavorite,
    getUserVote
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};