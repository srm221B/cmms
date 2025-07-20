"""Add new columns to assets table

Revision ID: add_asset_columns
Revises: 6f5b3557e360
Create Date: 2025-01-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_asset_columns'
down_revision = '6f5b3557e360'
branch_labels = None
depends_on = None

def upgrade():
    # Add new columns to assets table
    op.add_column('assets', sa.Column('running_hours', sa.DECIMAL(10, 2), nullable=True))
    op.add_column('assets', sa.Column('power_generation', sa.DECIMAL(10, 2), nullable=True))
    op.add_column('assets', sa.Column('load_factor', sa.DECIMAL(5, 2), nullable=True))
    op.add_column('assets', sa.Column('availability', sa.DECIMAL(5, 2), nullable=True))
    op.add_column('assets', sa.Column('cod', sa.Date(), nullable=True))
    op.add_column('assets', sa.Column('bim', sa.DECIMAL(10, 2), nullable=True))

    # Add indexes for better performance
    op.create_index('idx_assets_running_hours', 'assets', ['running_hours'])
    op.create_index('idx_assets_power_generation', 'assets', ['power_generation'])
    op.create_index('idx_assets_load_factor', 'assets', ['load_factor'])
    op.create_index('idx_assets_availability', 'assets', ['availability'])
    op.create_index('idx_assets_cod', 'assets', ['cod'])
    op.create_index('idx_assets_bim', 'assets', ['bim'])
    op.create_index('idx_assets_status', 'assets', ['status'])

def downgrade():
    # Remove indexes
    op.drop_index('idx_assets_status', 'assets')
    op.drop_index('idx_assets_bim', 'assets')
    op.drop_index('idx_assets_cod', 'assets')
    op.drop_index('idx_assets_availability', 'assets')
    op.drop_index('idx_assets_load_factor', 'assets')
    op.drop_index('idx_assets_power_generation', 'assets')
    op.drop_index('idx_assets_running_hours', 'assets')

    # Remove columns
    op.drop_column('assets', 'bim')
    op.drop_column('assets', 'cod')
    op.drop_column('assets', 'availability')
    op.drop_column('assets', 'load_factor')
    op.drop_column('assets', 'power_generation')
    op.drop_column('assets', 'running_hours') 