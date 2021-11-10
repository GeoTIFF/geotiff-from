const findAndRead = require("find-and-read");
const srvd = require("srvd");
const test = require("flug");
const toab = require("toab");

const from = require("./geotiff-from");

test("legacy support", async ({ eq }) => {
  const buf = findAndRead("GeogToWGS84GeoKey5.tif");
  const geotiff = await from({ data: buf });
  const image = await geotiff.getImage();
  eq(typeof geotiff === "object", true);
  eq(typeof image === "object", true);
});

test("cache", async ({ eq }) => {
  const port = 8080;
  const url = `http://localhost:${port}/data/abetow-ERD2018-EBIRD_SCIENCE-20191109-a5cf4cb2_hr_2018_abundance_median.tiff`;

  // start server that only serves 1 request
  srvd.serve({ debug: true, max: 1, port });

  const geotiff1 = await from(url, { debug: false, ovr: false });
  eq(typeof geotiff1 === "object", true);

  // try request again and should use cache
  const geotiff2 = await from(url, { debug: false, ovr: false });
  eq(geotiff1 === geotiff2, true);
});

[
  "GeogToWGS84GeoKey5.tif",
  "abetow-ERD2018-EBIRD_SCIENCE-20191109-a5cf4cb2_hr_2018_abundance_median.tiff",
  "eu_pasture.tiff",
  "nt_20201024_f18_nrt_s.tif",
  "utm.tif",
  "vestfold.tif",
  "wind_direction.tif"
].forEach(filename => {
  test("from buffer of " + filename, async ({ eq }) => {
    const buf = findAndRead("GeogToWGS84GeoKey5.tif");
    const geotiff = await from(buf);
    const image = await geotiff.getImage();
    eq(typeof geotiff === "object", true);
    eq(typeof image === "object", true);
  });
  test("from array buffer of " + filename, async ({ eq }) => {
    const buf = findAndRead("GeogToWGS84GeoKey5.tif");
    const geotiff = await from(await toab(buf));
    const image = await geotiff.getImage();
    eq(typeof geotiff === "object", true);
    eq(typeof image === "object", true);
  });
});

test("parsing url without overview", async ({ eq }) => {
  const url =
    "https://landsat-pds.s3.amazonaws.com/c1/L8/024/030/LC08_L1TP_024030_20180723_20180731_01_T1/LC08_L1TP_024030_20180723_20180731_01_T1_B1.TIF";
  const geotiff = await from(url, { debug: false, ovr: false });
  const image = await geotiff.getImage();
  eq(typeof geotiff === "object", true);
  eq(typeof image === "object", true);
  eq(image.getTileHeight(), 512);
  eq(image.getTileWidth(), 512);
});

test("parsing Landsat 8 Scene with implicit Overview URL", async ({ eq }) => {
  const url =
    "https://landsat-pds.s3.amazonaws.com/c1/L8/024/030/LC08_L1TP_024030_20180723_20180731_01_T1/LC08_L1TP_024030_20180723_20180731_01_T1_B1.TIF";
  const geotiff = await from(url, { debug: false, ovr: true });
  const image = await geotiff.getImage();
  eq(typeof geotiff === "object", true);
  eq(typeof image === "object", true);
  eq(image.getTileHeight(), 512);
  eq(image.getTileWidth(), 512);
  eq(await geotiff.getImageCount(), 1);
});

test("parsing Landsat 8 Scene with explicit Overview URL", async ({ eq }) => {
  const url =
    "https://landsat-pds.s3.amazonaws.com/c1/L8/024/030/LC08_L1TP_024030_20180723_20180731_01_T1/LC08_L1TP_024030_20180723_20180731_01_T1_B1.TIF";
  const ovrURL = url + ".ovr";
  const geotiff = await from([url, ovrURL], {
    debug: false,
    ovr: true
  });
  const image = await geotiff.getImage();
  eq(typeof geotiff === "object", true);
  eq(typeof image === "object", true);
  eq(image.getTileHeight(), 512);
  eq(image.getTileWidth(), 512);
  eq(await geotiff.getImageCount(), 5);
});
