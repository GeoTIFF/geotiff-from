# geotiff-from
With One Function, Load a GeoTIFF from an ArrayBuffer, Blob, Buffer, DataView, File, TypedArray, or URL

# features
- overview detection
- url caching

# install
```bash
npm install geotiff-from
```

# usage
```js
const from = require("geotiff-from");

const geotiff = await from(url);
const geotiff = await from([url, overview]);
const geotiff = await from(blob);
const geotiff = await from(arrayBuffer);
const geotiff = await from(buffer);
const geotiff = await from(dataView);
const geotiff = await from(uint8Array);
```

# advanced usage
## automatically detect overview files
If you pass a URL to geotiff-from, it can automatically check if an overview file
exists by issuing HEAD requests.  If you'd like to turn on this functionality, do
```js
const geotiff = await from(url, { ovr: true });
```
