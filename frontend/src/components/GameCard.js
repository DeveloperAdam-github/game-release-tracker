import React, { useState } from 'react';
import { Heart, ThumbsUp, ThumbsDown, Calendar, Star, ExternalLink, Share2, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useGame } from '../contexts/GameContext';
import { useToast } from '../hooks/use-toast';

const GameCard = ({ game, viewMode = 'grid' }) => {
  const { toggleFavorite, vote, getVoteCount, isFavorite, getUserVote } = useGame();
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const releaseDate = new Date(game.released);
  const isUpcoming = releaseDate > new Date();
  const daysUntilRelease = Math.ceil((releaseDate - new Date()) / (1000 * 60 * 60 * 24));
  
  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    toggleFavorite(game.id);
    toast({
      title: isFavorite(game.id) ? "Removed from favorites" : "Added to favorites",
      description: `${game.name} ${isFavorite(game.id) ? 'removed from' : 'added to'} your favorites list.`,
      duration: 2000,
    });
  };

  const handleVote = (voteType, e) => {
    e.preventDefault();
    const currentVote = getUserVote(game.id);
    const newVote = currentVote === voteType ? null : voteType;
    vote(game.id, newVote);
    
    toast({
      title: newVote ? `Voted ${voteType}` : 'Vote removed',
      description: `Your ${voteType} vote for ${game.name} has been ${newVote ? 'recorded' : 'removed'}.`,
      duration: 2000,
    });
  };

  const handleShare = (e) => {
    e.preventDefault();
    if (navigator.share) {
      navigator.share({
        title: game.name,
        text: `Check out ${game.name} releasing on ${releaseDate.toLocaleDateString()}!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Game link copied to clipboard.",
        duration: 2000,
      });
    }
  };

  if (viewMode === 'list') {
    return (
      <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg group">
        <CardContent className="p-0">
          <div className="flex">
            <div className="relative w-48 h-32 overflow-hidden">
              <img
                src={game.background_image}
                alt={game.name}
                className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-110 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setImageLoaded(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-blue-200 animate-pulse" />
              )}
              
              {isUpcoming && (
                <div className="absolute top-2 left-2">
                  <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-lg">
                    <Clock className="h-3 w-3 mr-1" />
                    {daysUntilRelease}d
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex-1 p-6 flex justify-between">
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                  {game.name}
                </h3>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {releaseDate.toLocaleDateString()}
                  </div>
                  {game.metacritic && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      {game.metacritic}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {game.platforms?.slice(0, 3).map((platform, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {platform.platform.name}
                    </Badge>
                  ))}
                  {game.genres?.slice(0, 2).map((genre, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFavoriteToggle}
                  className={`transition-all duration-300 ${
                    isFavorite(game.id) 
                      ? 'text-red-500 hover:text-red-600 scale-110' 
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${isFavorite(game.id) ? 'fill-current' : ''}`} />
                </Button>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleVote('upvote', e)}
                    className={`transition-all duration-300 ${
                      getUserVote(game.id) === 'upvote'
                        ? 'text-green-500 bg-green-50 scale-110'
                        : 'text-gray-400 hover:text-green-500'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-xs ml-1">{getVoteCount(game.id, 'upvote')}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleVote('downvote', e)}
                    className={`transition-all duration-300 ${
                      getUserVote(game.id) === 'downvote'
                        ? 'text-red-500 bg-red-50 scale-110'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span className="text-xs ml-1">{getVoteCount(game.id, 'downvote')}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border-0 shadow-lg group">
      <CardContent className="p-0">
        <div className="relative overflow-hidden">
          <img
            src={game.background_image}
            alt={game.name}
            className={`w-full h-48 object-cover transition-all duration-700 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-blue-200 animate-pulse" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {isUpcoming && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-lg animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                {daysUntilRelease} days
              </Badge>
            </div>
          )}
          
          <div className="absolute top-3 right-3 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFavoriteToggle}
              className={`bg-white/20 backdrop-blur-sm transition-all duration-300 ${
                isFavorite(game.id) 
                  ? 'text-red-500 bg-red-500/20 scale-110' 
                  : 'text-white hover:text-red-400 opacity-0 group-hover:opacity-100'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFavorite(game.id) ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 transition-colors">
              {game.name}
            </h3>
            
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {releaseDate.toLocaleDateString()}
              </div>
              {game.metacritic && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{game.metacritic}</span>
                </div>
              )}
            </div>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
              {game.description}
            </p>
          </div>
          
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1">
              {game.platforms?.slice(0, 3).map((platform, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {platform.platform.name}
                </Badge>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-1">
              {game.genres?.slice(0, 3).map((genre, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {genre.name}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleVote('upvote', e)}
                className={`transition-all duration-300 ${
                  getUserVote(game.id) === 'upvote'
                    ? 'text-green-500 bg-green-50 scale-110'
                    : 'text-gray-400 hover:text-green-500 hover:bg-green-50'
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span className="text-xs ml-1">{getVoteCount(game.id, 'upvote')}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleVote('downvote', e)}
                className={`transition-all duration-300 ${
                  getUserVote(game.id) === 'downvote'
                    ? 'text-red-500 bg-red-50 scale-110'
                    : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                }`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span className="text-xs ml-1">{getVoteCount(game.id, 'downvote')}</span>
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 transition-all duration-300"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameCard;