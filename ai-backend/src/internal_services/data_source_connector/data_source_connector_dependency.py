from fastapi import Depends

from src.internal_services.data_source_connector.data_source_connector_factory import DataSourceConnectorFactory
from src.services.data_source.data_source_dependency import get_user_data_source, get_user_data_source_for_charter
from src.services.data_source.data_source_model import DataSourceModel


def get_user_data_source_connector(data_source: DataSourceModel = Depends(get_user_data_source)):
    return DataSourceConnectorFactory.get_data_source_connector(data_source)


def get_user_data_source_connector_for_charter(
    data_source: DataSourceModel = Depends(get_user_data_source_for_charter),
):
    return DataSourceConnectorFactory.get_data_source_connector(data_source)
