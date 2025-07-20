from sqlalchemy import Column, Integer, ForeignKey, Table
from app.db.session import Base

# Association table for many-to-many relationship between users and roles
user_roles = Table(
    'user_roles', 
    Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id'), primary_key=True),
    Column('role_id', Integer, ForeignKey('roles.id'), primary_key=True),
    extend_existing=True
) 