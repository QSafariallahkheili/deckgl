
import psycopg2
from os import getenv

dbConfig = {
    'host': getenv('DB_HOST', 'localhost'),
    'port': getenv('DB_PORT', 5432),
    'dbname': getenv('DB_NAME', 'deckgl'),
    'user': getenv('DB_USER', 'postgres'),
    'password': getenv('DB_PASSWORD', 'postgres')
}

def connect():
  return psycopg2.connect(
    host=dbConfig['host'],
    port=dbConfig['port'], 
    dbname=dbConfig['dbname'], 
    user=dbConfig['user'], 
    password=dbConfig['password'])

def get_table_names():
  conn = connect()
  cur = conn.cursor()
  cur.execute(""" select table_name from information_schema.columns where column_name = 'geom' """)
  tables = cur.fetchall()
  cur.close()
  conn.close()
  return tables

def get_buildings_from_db(projectId):
  connection = connect()
  cursor = connection.cursor()
  get_building_query =f''' select json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(ST_AsGeoJSON(building.*)::json)
        )
        from building
        where project_id = '{projectId}'
      ;
  '''
  cursor.execute(get_building_query)
  building = cursor.fetchall()[0][0]
  cursor.close()
  connection.close()
  return building

def get_data_from_db_as_geobuf(tableName, projectId):
  connection = connect()
  cursor = connection.cursor()
  query = f'''
      SELECT ST_ASGeobuf(qs, 'geom')
      FROM (SELECT * FROM {tableName} 
      WHERE project_id='{projectId}') AS qs
      LIMIT 1; 
  '''
  cursor.execute(query)
  dataa = cursor.fetchone()
  cursor.close()
  connection.close()
  return dataa