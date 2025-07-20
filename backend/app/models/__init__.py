# First, import the base components
from app.db.session import Base
from app.models.base import BaseModel, TimestampMixin

# Import associations
from app.models.associations import user_roles

# Then import specific models
from app.models.user import User
from app.models.role import Role
from app.models.location import Location
from app.models.asset_category import AssetCategory
from app.models.asset import Asset
from app.models.inventory import InventoryMaster, InventoryBalance, InventoryInflow
from app.models.transfer import TransferHeader, TransferItem
from app.models.work_order import WorkOrderType, WorkOrder, WorkOrderTask, WorkOrderPart
from app.models.document import Document

# Define all models for easy importing
__all__ = [
    'Base',
    'BaseModel',
    'TimestampMixin',
    'user_roles',
    'User',
    'Role',
    'Location',
    'AssetCategory',
    'Asset',
    'InventoryMaster',
    'InventoryBalance',
    'InventoryInflow',
    'TransferHeader',
    'TransferItem',
    'WorkOrderType',
    'WorkOrder',
    'WorkOrderTask',
    'WorkOrderPart',
    'Document'
]