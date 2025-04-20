"""add title to charter_chat_conversation

Revision ID: add_title_to_charter_chat
Revises: f11c37cbfac2
Create Date: 2023-07-10 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_title_to_charter_chat'
down_revision = 'f11c37cbfac2'
branch_labels = None
depends_on = None


def upgrade():
    # Add title column to charter_chat_conversation table
    op.add_column('charter_chat_conversation', sa.Column('title', sa.String(255), nullable=True))


def downgrade():
    # Remove title column from charter_chat_conversation table
    op.drop_column('charter_chat_conversation', 'title')
