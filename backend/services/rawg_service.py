import httpx
import os
from typing import Optional, List, Dict, Any
from models import RAWGGamesResponse, RAWGGame, GamesQuery
import logging

logger = logging.getLogger(__name__)

class RAWGService:
    def __init__(self):
        self.api_key = os.environ.get('RAWG_API_KEY')
        self.base_url = "https://api.rawg.io/api"
        
        if not self.api_key:
            logger.warning("RAWG_API_KEY environment variable not found, using fallback")
            self.api_key = "4f4b5e6a94974419966803f6036df26b"  # Fallback to provided key
    
    async def get_games(self, query: GamesQuery) -> Optional[RAWGGamesResponse]:
        """Fetch games from RAWG API with filters"""
        try:
            params = {
                'key': self.api_key,
                'page_size': query.page_size,
                'page': query.page,
                'ordering': query.ordering
            }
            
            # Add search filter
            if query.search:
                params['search'] = query.search
            
            # Add platform filter
            if query.platform and query.platform != 'All Platforms':
                platform_mapping = {
                    'PC': 4,
                    'PlayStation 5': 187,
                    'Xbox Series S/X': 186,
                    'Nintendo Switch': 7,
                    'PlayStation 4': 18,
                    'Xbox One': 1,
                    'iOS': 3,
                    'Android': 21
                }
                if query.platform in platform_mapping:
                    params['platforms'] = platform_mapping[query.platform]
            
            # Add genre filter
            if query.genre and query.genre != 'All Genres':
                genre_mapping = {
                    'Action': 4,
                    'Adventure': 3,
                    'RPG': 5,
                    'FPS': 2,
                    'Platformer': 83,
                    'Racing': 1,
                    'Sports': 15,
                    'Strategy': 10,
                    'Simulation': 14,
                    'Puzzle': 7,
                    'Arcade': 11,
                    'Fighting': 6,
                    'Shooter': 2,
                    'Casual': 40
                }
                if query.genre in genre_mapping:
                    params['genres'] = genre_mapping[query.genre]
            
            # Add date range filter
            if query.dates:
                params['dates'] = query.dates
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{self.base_url}/games", params=params)
                response.raise_for_status()
                
                data = response.json()
                return RAWGGamesResponse(**data)
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching games: {e}")
            return None
        except Exception as e:
            logger.error(f"Error fetching games: {e}")
            return None
    
    async def get_game_details(self, game_id: int) -> Optional[RAWGGame]:
        """Fetch detailed information about a specific game"""
        try:
            params = {'key': self.api_key}
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(f"{self.base_url}/games/{game_id}", params=params)
                response.raise_for_status()
                
                data = response.json()
                return RAWGGame(**data)
                
        except httpx.HTTPError as e:
            logger.error(f"HTTP error fetching game details: {e}")
            return None
        except Exception as e:
            logger.error(f"Error fetching game details: {e}")
            return None
    
    async def get_upcoming_games(self, days_ahead: int = 365) -> Optional[RAWGGamesResponse]:
        """Fetch upcoming games for the next specified days"""
        try:
            from datetime import datetime, timedelta
            
            today = datetime.now().strftime('%Y-%m-%d')
            future_date = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
            
            query = GamesQuery(
                dates=f"{today},{future_date}",
                ordering='released',
                page_size=40
            )
            
            # Get upcoming games and filter out those without release dates or images
            response = await self.get_games(query)
            if response and response.results:
                # Filter games to ensure they have proper data
                filtered_games = []
                for game in response.results:
                    # Only include games with release dates and images
                    if (game.released and 
                        game.background_image and 
                        game.released != "TBA" and 
                        game.released.strip()):
                        filtered_games.append(game)
                
                response.results = filtered_games
                response.count = len(filtered_games)
            
            return response
            
        except Exception as e:
            logger.error(f"Error fetching upcoming games: {e}")
            return None
    
    async def search_games(self, search_term: str, page: int = 1) -> Optional[RAWGGamesResponse]:
        """Search for games by name"""
        try:
            query = GamesQuery(
                search=search_term,
                page=page,
                page_size=20,
                ordering='-rating'
            )
            
            return await self.get_games(query)
            
        except Exception as e:
            logger.error(f"Error searching games: {e}")
            return None

# Create service instance - will be initialized when imported
rawg_service = None

def get_rawg_service():
    global rawg_service
    if rawg_service is None:
        rawg_service = RAWGService()
    return rawg_service