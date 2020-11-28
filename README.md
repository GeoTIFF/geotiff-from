# geotiff-from
With One Function, Load a GeoTIFF from an ArrayBuffer, Blob, Buffer, DataView, File, TypedArray, or URL

# install
```bash
npm install geotiff-from
```

# usage
```js
const from = require("geotiff-from");

const geotiff = await from({ data: url });
const geotiff = await from({ data: urls });
const geotiff = await from({ data: blob });
const geotiff = await from({ data: arrayBuffer });
const geotiff = await from({ data: buffer });
const geotiff = await from({ data: dataView });
const geotiff = await from({ data: uint8Array });
```

# advanced usage
## automatically detect overview files
If you pass a URL to geotiff-from, it can automatically check if an overview file
exists by issuing HEAD requests.  If you'd like to turn on this functionality, do
```
const geotiff = await from({ data: url, ovr: true });
```
