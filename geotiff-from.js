const { fromArrayBuffer, fromBlob, fromUrl, fromUrls } = require("geotiff");
const toab = require("toab");
const doesUrlExist = require("does-url-exist");

const isURL = data => typeof data === "string" && data.startsWith("http");

async function findOverviewURL({ debug, url }) {
  if (debug)
    console.log("[geotiff-from.findOverviewURL] starting with url", url);
  const candidates = [url + ".ovr", url + ".OVR"];
  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    if (await doesUrlExist({ url: candidate })) {
      if (debug)
        console.log("[geotiff-from.findOverviewURL] found " + candidate);
      return candidate;
    }
  }
}

async function from({ data, debug, ovr = false }) {
  if (debug)
    console.log(
      "[geotiff-from] starting with",
      JSON.stringify({ data, debug, ovr })
    );

  if (Array.isArray(data)) {
    if (debug) console.log("[geotiff-from] data is an array");
    if (data.every(isURL)) {
      const mainURL = data.find(url => url.match(/\.tif$/i));
      const overviewURLS = data.filter(url => url.match(/\.ovr$/i));
      return fromUrls(mainURL, overviewURLS, { cache: true, forceXHR: false });
    }
  }

  if (isURL(data)) {
    const url = data;
    if (debug) console.log("[geotiff-from] data is a url");
    const ovrURL = ovr === true ? await findOverviewURL({ debug, url }) : null;
    if (ovrURL) {
      // for discussion of cache, see https://github.com/geotiffjs/geotiff.js/issues/61
      return fromUrls(url, [ovrURL], { cache: true, forceXHR: false });
    } else {
      return fromUrl(url, { cache: true, forceXHR: false });
    }
  }

  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return fromBlob(data);
  }

  /*
        try to convert to arrayBuffer
        toab supports the following:
            - ArrayBuffer
            - Buffer
            - TypedArrays
            - File
            - Response
            - Data URLs (browser only)
            - Text
    */
  const arrayBuffer = await toab(data, { debug });
  if (arrayBuffer) {
    if (debug) console.log("[geotiff-from] arrayBuffer:", arrayBuffer);
    return fromArrayBuffer(arrayBuffer);
  }
}

module.exports = from;
