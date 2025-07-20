from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.db.session import get_db
from app.models.location import Location as LocationModel
from app.schemas.location import Location, LocationCreate, LocationUpdate

router = APIRouter(prefix="/locations", tags=["locations"])

@router.get("/", response_model=List[Location])
def read_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    locations = db.query(LocationModel).offset(skip).limit(limit).all()
    return locations

@router.post("/", response_model=Location, status_code=status.HTTP_201_CREATED)
def create_location(location: LocationCreate, db: Session = Depends(get_db)):
    db_location = LocationModel(
        name=location.name,
        description=location.description,
        address=location.address
    )
    
    db.add(db_location)
    db.commit()
    db.refresh(db_location)
    return db_location

@router.get("/{location_id}", response_model=Location)
def read_location(location_id: int, db: Session = Depends(get_db)):
    location = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    return location

@router.put("/{location_id}", response_model=Location)
def update_location(location_id: int, location: LocationUpdate, db: Session = Depends(get_db)):
    db_location = db.query(LocationModel).filter(LocationModel.id == location_id).first()
    if db_location is None:
        raise HTTPException(status_code=404, detail="Location not found")
    
    update_data = location.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_location, key, value)
    
    db.commit()
    db.refresh(db_location)
    return db_location