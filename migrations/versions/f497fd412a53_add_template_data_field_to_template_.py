"""Add template_data field to Template model

Revision ID: f497fd412a53
Revises: b13c33ffe909
Create Date: 2025-03-11 14:39:27.687728

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f497fd412a53'
down_revision = 'b13c33ffe909'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('template', schema=None) as batch_op:
        batch_op.add_column(sa.Column('description', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('template_data', sa.Text(), nullable=True))
        batch_op.add_column(sa.Column('updated_at', sa.DateTime(), nullable=True))
        batch_op.drop_column('thumbnail_url')
        batch_op.drop_column('template_json')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('template', schema=None) as batch_op:
        batch_op.add_column(sa.Column('template_json', sa.TEXT(), nullable=True))
        batch_op.add_column(sa.Column('thumbnail_url', sa.VARCHAR(length=200), nullable=True))
        batch_op.drop_column('updated_at')
        batch_op.drop_column('template_data')
        batch_op.drop_column('description')

    # ### end Alembic commands ###
