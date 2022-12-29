
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
