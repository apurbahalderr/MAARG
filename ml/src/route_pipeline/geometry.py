import math

def decode_polyline(polyline_str, precision=6):
    index, lat, lng = 0, 0, 0
    coordinates = []
    factor = 10.0 ** precision

    while index < len(polyline_str):
        shift, result = 0, 0
        while True:
            b = ord(polyline_str[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20: break
        dlat = ~(result >> 1) if (result & 1) else (result >> 1)
        lat += dlat

        shift, result = 0, 0
        while True:
            b = ord(polyline_str[index]) - 63
            index += 1
            result |= (b & 0x1f) << shift
            shift += 5
            if b < 0x20: break
        dlng = ~(result >> 1) if (result & 1) else (result >> 1)
        lng += dlng

        coordinates.append({"lat": lat / factor, "lon": lng / factor})
    return coordinates

def encode_polyline(coordinates, precision=6):
    def encode_value(value):
        value = int(round(value * (10 ** precision)))
        value = ~(value << 1) if value < 0 else (value << 1)
        chunks = ""
        while value >= 0x20:
            chunks += chr((0x20 | (value & 0x1f)) + 63)
            value >>= 5
        chunks += chr(value + 63)
        return chunks

    result = ""
    last_lat, last_lng = 0, 0
    for coord in coordinates:
        result += encode_value(coord["lat"] - last_lat)
        result += encode_value(coord["lon"] - last_lng)
        last_lat, last_lng = coord["lat"], coord["lon"]
    return result

def haversine_km(coord1, coord2):
    R = 6371.0
    lat1, lon1 = math.radians(coord1["lat"]), math.radians(coord1["lon"])
    lat2, lon2 = math.radians(coord2["lat"]), math.radians(coord2["lon"])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def segment_route(decoded_geometry, target_km=1.0):
    if not decoded_geometry:
        return []
        
    segments = []
    current_segment_geom = [decoded_geometry[0]]
    current_length = 0.0
    segment_index = 0
    start_km = 0.0
    
    for i in range(1, len(decoded_geometry)):
        p1 = decoded_geometry[i-1]
        p2 = decoded_geometry[i]
        dist = haversine_km(p1, p2)
        
        current_segment_geom.append(p2)
        current_length += dist
        
        if current_length >= target_km or i == len(decoded_geometry) - 1:
            segments.append({
                "segment_index": segment_index,
                "start_km": round(start_km, 3),
                "end_km": round(start_km + current_length, 3),
                "start_coordinate": current_segment_geom[0],
                "end_coordinate": current_segment_geom[-1],
                "geometry": list(current_segment_geom)
            })
            segment_index += 1
            start_km += current_length
            current_segment_geom = [p2]
            current_length = 0.0
            
    return segments
