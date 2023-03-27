from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
import json
from db import connect, get_table_names, get_buildings_from_db, get_data_from_db_as_geobuf
import requests
from osmtogeojson import osmtogeojson



app = FastAPI()
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
]


app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def sure_float(may_be_number):  
    # function which extracts surely the integer or float inside a string
    # will handle strings like "23m" or "23,5 m" or "23.0 m" correctly
    my_sure_float = "0"
    try:
        my_sure_float = float(may_be_number)
    except:
        may_be_number = may_be_number.strip()
        may_be_number = may_be_number.replace(",", ".")
        may_be_number = may_be_number.replace("'", ".")
        for x in may_be_number:
            if x in "0123456789.":
                my_sure_float = my_sure_float + x
            elif x.isspace():
                break
        my_sure_float = float(my_sure_float)

    return my_sure_float

@app.post("/get-buildings-from-db")
async def get_buildings_from_db_api(request: Request):
    data = await request.json()
    return get_buildings_from_db(data)


@app.get("/")
async def get_buildings_from_osm():
    projectId = "0"
    bbox = f"""{52.385352},{13.015445},{52.420751},{13.092177}"""
    
    overpass_url = "http://overpass-api.de/api/interpreter"
    

    overpass_query_building_parts = f"""
        [out:json];
        (
            (
                way[building]({bbox});
                way["building:part"]({bbox});
            );
            -
            (
                rel(bw:"outline");
                way(r:"outline");
            );
        );
        convert item ::=::,::geom=geom(),_osm_type=type();
        out geom;
    """
    response_building = requests.get(
        overpass_url, params={"data": overpass_query_building_parts}
    )

    data_building = response_building.json()

    ###############
    overpass_query_building_with_hole = f"""
        [out:json];
           
                (
                    rel["building"]({bbox});
                   
                );
                
            (._;>;);
            out geom;
        """
    response_building_with_hole = requests.get(
        overpass_url, params={"data": overpass_query_building_with_hole}
    )
    results = response_building_with_hole.json()
    for f in results["elements"]:
        if "type" in f and f["type"] == "relation":
            if(f["members"][0]["role"] != "outer"):
                i = 0
                for x in f["members"]:
                    if x["role"] == "outer":
                        f["members"][0], f["members"][i] = f["members"][i],f["members"][0]
                        break
                    i += 1
                
    bhole = osmtogeojson.process_osm_json(results)
    # print(bhole)
    connectionn = connect()
    cursorr = connectionn.cursor()
    insert_query_buildingg = """
        INSERT INTO building (project_id,wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, amenity, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));
    """
    for f in bhole["features"]:
        
        if "type" in f["properties"] and f["properties"]["type"] == "multipolygon":
            
            wallcolor = None
            if "building:colour" in f["properties"]:
                wallcolor = f["properties"]["building:colour"]
            wallmaterial = None
            if "building:material" in f["properties"]:
                wallmaterial = f["properties"]["building:material"]
            roofcolor = None
            if "roof:colour" in f["properties"]:
                roofcolor = f["properties"]["roof:colour"]
            roofmaterial = None
            if "roof:material" in f["properties"]:
                roofmaterial = f["properties"]["roof:material"]
            roofshape = None
            if "roof:shape" in f["properties"]:
                roofshape = f["properties"]["roof:shape"]
            roofheight = None
            if "roof:height" in f["properties"]:
                roofheight = f["properties"]["roof:height"]
                if "," in roofheight:
                    roofheight = roofheight.replace(",", ".")
            height = None
            if "height" in f["properties"]:
                height = f["properties"]["height"]
                height = sure_float(height)
            floors = None
            if "building:levels" in f["properties"]:
                floors = f["properties"]["building:levels"]
                floors = sure_float(floors)

            estimatedheight = None
            if height is not None:
                estimatedheight = sure_float(height)
            elif floors is not None:
                estimatedheight = sure_float(floors) * 3.5
            else:
                estimatedheight = 15
            amenity = None
            if "amenity" in f["properties"]:
                amenity = f["properties"]["amenity"]  
            cursorr.execute(
                    insert_query_buildingg,
                    (
                        projectId,
                        wallcolor,
                        None,
                        None,
                        None,
                        None,
                        None,
                        height,
                        floors,
                        estimatedheight,
                        amenity,
                        json.dumps(f["geometry"]),
                    ),
            )
         
    connectionn.commit()
    cursorr.close()
    connectionn.close()

    connection = connect()
    cursor = connection.cursor()
       # INSERT INTO building (wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));
    insert_query_building = """
        INSERT INTO building (project_id,wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, amenity, geom) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s, %s, ST_SetSRID(ST_GeomFromGeoJSON(%s), 4326));
    """
    for f in data_building["elements"]:
        #print(f)
        f["geometry"]["type"] = "Polygon"
        f["geometry"]["coordinates"] = [f["geometry"]["coordinates"]]
    for f in data_building["elements"]:
       # print(f)
        wallcolor = None
        if "building:colour" in f["tags"]:
            wallcolor = f["tags"]["building:colour"]
        wallmaterial = None
        if "building:material" in f["tags"]:
            wallmaterial = f["tags"]["building:material"]
        roofcolor = None
        if "roof:colour" in f["tags"]:
            roofcolor = f["tags"]["roof:colour"]
        roofmaterial = None
        if "roof:material" in f["tags"]:
            roofmaterial = f["tags"]["roof:material"]
        roofshape = None
        if "roof:shape" in f["tags"]:
            roofshape = f["tags"]["roof:shape"]
        roofheight = None
        if "roof:height" in f["tags"]:
            roofheight = f["tags"]["roof:height"]
            if "," in roofheight:
                roofheight = roofheight.replace(",", ".")
        height = None
        if "height" in f["tags"]:
            height = f["tags"]["height"]
            height = sure_float(height)
        floors = None
        if "building:levels" in f["tags"]:
            floors = f["tags"]["building:levels"]
            floors = sure_float(floors)

        estimatedheight = None
        if height is not None:
            estimatedheight = sure_float(height)
        elif floors is not None:
            estimatedheight = sure_float(floors) * 3.5
        else:
            estimatedheight = 15

        amenity = None
        if "amenity" in f["tags"]:
            amenity = f["tags"]["amenity"]
        geom = json.dumps(f["geometry"])
        #print(geom)
        # get_buildings_from_osm(wallcolor,wallmaterial, roofcolor,roofmaterial,roofshape,roofheight, height, floors, estimatedheight, geom)
        cursor.execute(
            insert_query_building,
            (
                projectId,
                wallcolor,
                None,
                None,
                None,
                None,
                None,
                height,
                floors,
                estimatedheight,
                amenity,
                geom,
            ),
        )

    connection.commit()
    cursor.close()
    connection.close()

    # building refinement: identifing and deleting duplicated buildings and small overlapping building geometries
    
    connection = connect()
    cursor = connection.cursor()
    
    refinement_building_query = f"""
        with buildingone as (select * from building where project_id = '{projectId}' and st_isvalid(geom))
        delete from building where id in (
            select building.id from building, buildingone
            where building.project_id = '{projectId}' 
                and st_isvalid(building.geom) 
                and st_equals(building.geom, buildingone.geom) 
                and building.id <> buildingone.id
        );
        with buildingone as (select * from building where project_id = '{projectId}' and st_isvalid(geom))
            
        delete from building where id in (
            select building.id from building, buildingone 
            where building.project_id = '{projectId}' 
                and st_isvalid(building.geom) 
                and st_within(building.geom, buildingone.geom) 
                and building.id <> buildingone.id 
                and buildingone.estimatedheight >=building.estimatedheight);
    """
    
    cursor.execute(refinement_building_query)
    connection.commit()
    cursor.close()
    connection.close()
    

    return "fine"
