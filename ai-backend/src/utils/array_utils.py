def merge_arrays(array1, array2):
    merged = {}
    for obj in array1 + array2:
        merged[obj.id] = obj
    return list(merged.values())
