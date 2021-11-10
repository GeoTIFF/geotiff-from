const { fromArrayBuffer, fromBlob, fromUrl, fromUrls } = require("geotiff");
const LRUCache = require("lru-cache");
const toab = require("toab");
const doesUrlExist = require("does-url-exist");

const isURL = data => typeof data === "string" && data.startsWith("http");

const cache = new LRUCache({
  max: 10,
  maxAge: 1000 * 60 * 60
});

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

async function from(data, { debug, ovr = false } = {}) {
  // check if using legacy method
  if (typeof arguments[0] === "object" && "data" in arguments[0]) {
    return from(data.data, arguments[0]);
  }

  if (debug)
    console.log(
      "[geotiff-from] starting with options",
      JSON.stringify({ data: typeof data, debug, ovr })
    );

  // quick return
  if (typeof data === "string" && cache.has(data)) {
    return cache.get(data);
  }

  // if data is a promise, wait for it
  if (typeof data === "object" && typeof data.then === "function") {
    data = await data;
  }

  // filter out any empties
  if (Array.isArray(data))
    data = data.filter(it => it !== null && it !== undefined && it !== "");

  // [data] to data
  if (Array.isArray(data) && data.length === 1 && typeof data[0] !== "number") {
    data = data[0];
  }

  // one url
  if (typeof data === "string") {
    const url = data;
    if (debug) console.log("[geotiff-from] data is probably a url");
    const ovrURL = ovr === true ? await findOverviewURL({ debug, url }) : null;
    if (ovrURL) {
      const key = JSON.stringify([url, ovrURL]);
      if (!cache.has(key)) cache.set(key, fromUrls(url, ovrURL));
      return cache.get(key);
    } else {
      if (!cache.has(url)) cache.set(url, fromUrl(url));
      return cache.get(url);
    }
  }

  // array of urls
  if (Array.isArray(data) && data.every(it => typeof it === "string")) {
    if (debug) console.log("[geotiff-from] data is an array");
    if (data.length === 1) {
      const url = data[0];
      if (!cache.has(url)) cache.set(url, fromUrl(url));
      return cache.get(url);
    } else {
      const mainURL = data.find(
        url =>
          url.toLowerCase().includes(".tif") &&
          !url.toLowerCase().includes(".ovr")
      );
      const overviewURLs = data.filter(url =>
        url.toLowerCase().includes(".ovr")
      );
      if (mainURL && overviewURLs.length === data.length - 1) {
        const key = JSON.stringify([mainURL, overviewURLs]);
        if (!cache.has(key)) cache.set(key, fromUrls(mainURL, overviewURLs));
        return cache.get(key);
      } else if (mainURL && overviewURLs.length === 0) {
        // if we couldn't find any overview urls using the .ovr extension
        // just assume all the non-main URLs are overviews
        const otherURLs = data.filter(url => url !== mainURL);
        if (!cache.has(key)) cache.set(key, fromUrls(mainURL, otherURLs));
        return cache.get(key);
      }
    }
  }

  if (typeof Blob !== "undefined" && data instanceof Blob) {
    return fromBlob(data);
  }

  // if not successfull so far, try to convert everything
  // to an array buffer
  const arrayBuffer = await toab(data);
  if (arrayBuffer) {
    return fromArrayBuffer(arrayBuffer);
  }

  throw new Error("[geotiff-from] unsuccessful");
}

if (typeof module === "object") module.exports = from;
