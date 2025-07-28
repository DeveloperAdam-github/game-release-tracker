from fastapi import FastAPI, APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime

# Import our models and services
from models import (
    StatusCheck, StatusCheckCreate, FavoriteCreate, VoteCreate,
    GamesQuery, GameWithUserData, UserFavorite, UserVote
)
from services.game_service import GameService

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize game service
game_service = GameService(db)

# Create the main app without a prefix
app = FastAPI(title="GameTracker API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Health check endpoints
@api_router.get("/")
async def root():
    return {"message": "GameTracker API is running!"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Game endpoints
@api_router.get("/games", response_model=List[GameWithUserData])
async def get_games(
    user_id: str = Query(default="anonymous"),
    search: Optional[str] = Query(None, description="Search games by name"),
    platform: Optional[str] = Query(None, description="Filter by platform"),
    genre: Optional[str] = Query(None, description="Filter by genre"),
    dates: Optional[str] = Query(None, description="Date range filter (YYYY-MM-DD,YYYY-MM-DD)"),
    ordering: Optional[str] = Query("released", description="Sort order"),
    page_size: Optional[int] = Query(20, ge=1, le=40, description="Number of games per page"),
    page: Optional[int] = Query(1, ge=1, description="Page number")
):
    """Get games with user-specific data (favorites, votes)"""
    try:
        query = GamesQuery(
            search=search,
            platform=platform,
            genre=genre,
            dates=dates,
            ordering=ordering,
            page_size=page_size,
            page=page
        )
        
        games = await game_service.get_games_with_user_data(query, user_id)
        
        if games is None:
            raise HTTPException(status_code=500, detail="Failed to fetch games")
        
        return games
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in get_games: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/games/upcoming")
async def get_upcoming_games(
    user_id: str = Query(default="anonymous"),
    days_ahead: int = Query(365, ge=1, le=1095, description="Days to look ahead (max 3 years)"),
    year: str = Query("2025", description="Year filter: 2025, 2026, or both")
):
    """Get upcoming games for the next specified days or specific year"""
    try:
        from datetime import datetime, timedelta
        
        # Always start from today to only show future games
        today = datetime.now().strftime('%Y-%m-%d')
        
        # Handle year-based filtering
        if year == "2025":
            start_date = max(today, "2025-01-01")  # Start from today or 2025-01-01, whichever is later
            end_date = "2025-12-31"
        elif year == "2026":
            start_date = max(today, "2026-01-01")  # Start from today or 2026-01-01, whichever is later
            end_date = "2026-12-31"
        elif year == "both":
            start_date = today  # Always start from today
            end_date = "2026-12-31"
        else:
            # Default to current date + days_ahead
            future_date = (datetime.now() + timedelta(days=days_ahead)).strftime('%Y-%m-%d')
            start_date = today
            end_date = future_date
        
        query = GamesQuery(
            dates=f"{start_date},{end_date}",
            ordering='released',
            page_size=60  # Increased to get more games
        )
        
        games = await game_service.get_games_with_user_data(query, user_id)
        
        if games is None:
            raise HTTPException(status_code=500, detail="Failed to fetch upcoming games")
        
        # Additional filter to ensure only future games (in case API returns past games)
        today_date = datetime.now().date()
        filtered_games = []
        for game in games:
            if game.released:
                try:
                    game_date = datetime.strptime(game.released, '%Y-%m-%d').date()
                    if game_date >= today_date:
                        filtered_games.append(game)
                except ValueError:
                    # Skip games with invalid date formats
                    continue
        
        return filtered_games
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in get_upcoming_games: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Favorites endpoints
@api_router.post("/favorites")
async def add_favorite(favorite_data: FavoriteCreate):
    """Add a game to favorites"""
    try:
        favorite = await game_service.add_favorite(favorite_data)
        
        if favorite is None:
            raise HTTPException(status_code=500, detail="Failed to add favorite")
        
        return {"message": "Game added to favorites", "favorite": favorite}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in add_favorite: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.delete("/favorites/{game_id}")
async def remove_favorite(
    game_id: int,
    user_id: str = Query(..., description="User ID")
):
    """Remove a game from favorites"""
    try:
        success = await game_service.remove_favorite(user_id, game_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Favorite not found")
        
        return {"message": "Game removed from favorites"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in remove_favorite: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/favorites")
async def get_user_favorites(
    user_id: str = Query(..., description="User ID")
):
    """Get user's favorite games"""
    try:
        favorites = await game_service.get_user_favorites(user_id)
        return favorites
        
    except Exception as e:
        logging.error(f"Error in get_user_favorites: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Voting endpoints
@api_router.post("/votes")
async def vote_game(vote_data: VoteCreate):
    """Vote on a game (upvote/downvote)"""
    try:
        if vote_data.vote_type not in ['upvote', 'downvote']:
            raise HTTPException(status_code=400, detail="Vote type must be 'upvote' or 'downvote'")
        
        vote = await game_service.vote_game(vote_data)
        
        return {
            "message": "Vote recorded" if vote else "Vote removed",
            "vote": vote
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error in vote_game: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@api_router.get("/games/{game_id}/stats")
async def get_game_stats(game_id: int):
    """Get voting statistics for a specific game"""
    try:
        stats = await game_service.get_games_vote_stats([game_id])
        game_stats = stats.get(game_id)
        
        if not game_stats:
            return {"game_id": game_id, "upvotes": 0, "downvotes": 0, "total_votes": 0}
        
        return game_stats
        
    except Exception as e:
        logging.error(f"Error in get_game_stats: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
