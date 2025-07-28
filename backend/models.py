from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

# RAWG API Response Models
class RAWGPlatform(BaseModel):
    id: int
    name: str
    slug: str

class RAWGPlatformInfo(BaseModel):
    platform: RAWGPlatform

class RAWGGenre(BaseModel):
    id: int
    name: str
    slug: str

class RAWGGame(BaseModel):
    id: int
    name: str
    slug: str
    background_image: Optional[str] = None
    released: Optional[str] = None
    tba: bool = False
    rating: Optional[float] = None
    rating_top: Optional[int] = None
    ratings_count: Optional[int] = None
    metacritic: Optional[int] = None
    platforms: Optional[List[RAWGPlatformInfo]] = None
    genres: Optional[List[RAWGGenre]] = None
    short_screenshots: Optional[List[Dict[str, Any]]] = None
    esrb_rating: Optional[Dict[str, Any]] = None
    description_raw: Optional[str] = None

class RAWGGamesResponse(BaseModel):
    count: int
    next: Optional[str] = None
    previous: Optional[str] = None
    results: List[RAWGGame]

# Database Models
class UserFavorite(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str  # For now, we'll use a simple string identifier
    game_id: int
    game_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserVote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    game_id: int
    vote_type: str  # 'upvote' or 'downvote'
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class GameStats(BaseModel):
    game_id: int
    upvotes: int = 0
    downvotes: int = 0
    total_votes: int = 0
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Request/Response Models for API
class FavoriteCreate(BaseModel):
    user_id: str
    game_id: int
    game_name: str

class FavoriteResponse(BaseModel):
    id: str
    user_id: str
    game_id: int
    game_name: str
    created_at: datetime

class VoteCreate(BaseModel):
    user_id: str
    game_id: int
    vote_type: str  # 'upvote' or 'downvote'

class VoteResponse(BaseModel):
    id: str
    user_id: str
    game_id: int
    vote_type: str
    created_at: datetime

class GamesQuery(BaseModel):
    search: Optional[str] = None
    platform: Optional[str] = None
    genre: Optional[str] = None
    dates: Optional[str] = None  # Format: YYYY-MM-DD,YYYY-MM-DD
    ordering: Optional[str] = 'released'
    page_size: Optional[int] = 20
    page: Optional[int] = 1

class UserGameData(BaseModel):
    user_id: str
    favorites: List[int] = []
    votes: Dict[str, str] = {}  # game_id -> vote_type

class GameWithUserData(RAWGGame):
    is_favorite: bool = False
    user_vote: Optional[str] = None
    vote_stats: Optional[GameStats] = None