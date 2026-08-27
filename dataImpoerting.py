import imdlib as imd
import os

# 1. Define your target directory
raw_dir = "ml/data/raw/imd_rainfall/"
os.makedirs(raw_dir, exist_ok=True)

# 2. Download the data (example for a few recent years)
start_yr = 2020
end_yr = 2024
variable = 'rain'

# This fetches the IMD binary files temporarily
imd.get_data(variable, start_yr, end_yr, fn_format='yearwise')

# 3. Read the downloaded data
data = imd.open_data(variable, start_yr, end_yr, 'yearwise')

# 4. Convert to xarray and save as NetCDF in your raw folder
ds = data.get_xarray()
nc_path = os.path.join(raw_dir, f"imd_rainfall_{start_yr}_{end_yr}.nc")
ds.to_netcdf(nc_path)