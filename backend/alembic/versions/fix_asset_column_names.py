"""Fix asset column names to match model definition

Revision ID: fix_asset_column_names
Revises: add_asset_columns
Create Date: 2025-01-19 11:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'fix_asset_column_names'
down_revision = 'add_asset_columns'
branch_labels = None
depends_on = None

def upgrade():
    # Rename columns to match model definition
    op.alter_column('assets', 'category_id', new_column_name='asset_category_id')
    op.alter_column('assets', 'purchase_date', new_column_name='installation_date')
    op.alter_column('assets', 'warranty_expiry_date', new_column_name='warranty_expiry')
    
    # Add missing columns
    op.add_column('assets', sa.Column('specifications', sa.Text(), nullable=True))

def downgrade():
    # Revert column names
    op.alter_column('assets', 'asset_category_id', new_column_name='category_id')
    op.alter_column('assets', 'installation_date', new_column_name='purchase_date')
    op.alter_column('assets', 'warranty_expiry', new_column_name='warranty_expiry_date')
    
    # Remove added columns
    op.drop_column('assets', 'specifications') 