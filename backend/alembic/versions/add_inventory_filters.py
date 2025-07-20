"""Add category and criticality columns to inventory_master table

Revision ID: add_inventory_filters
Revises: add_asset_columns
Create Date: 2025-01-19 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_inventory_filters'
down_revision = 'fix_asset_column_names'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to inventory_master table
    op.add_column('inventory_master', sa.Column('category', sa.String(100), nullable=True))
    op.add_column('inventory_master', sa.Column('criticality', sa.String(50), nullable=True))

    # Add indexes for better performance
    op.create_index('idx_inventory_master_category', 'inventory_master', ['category'])
    op.create_index('idx_inventory_master_criticality', 'inventory_master', ['criticality'])

def downgrade():
    # Remove indexes
    op.drop_index('idx_inventory_master_criticality', 'inventory_master')
    op.drop_index('idx_inventory_master_category', 'inventory_master')
    
    # Remove columns
    op.drop_column('inventory_master', 'criticality')
    op.drop_column('inventory_master', 'category') 