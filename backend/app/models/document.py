from sqlalchemy import Column, String, Text, Integer, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Document(BaseModel):
    __tablename__ = "documents"
    
    name = Column(String(100), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_type = Column(String(50))
    size = Column(Integer)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    uploaded_by = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'))
    created_at = Column(TIMESTAMP, nullable=False)
    
    # Relationships
    uploader = relationship("User")