const test = require("ava");
const fs = require("fs");
const from = require("./geotiff-from");

test("parsing url without overview", async t => {
  const url =
    "https://landsat-pds.s3.amazonaws.com/c1/L8/024/030/LC08_L1TP_024030_20180723_20180731_01_T1/LC08_L1TP_024030_20180723_20180731_01_T1_B1.TIF";
  const geotiff = await from({ data: url, debug: false, ovr: false });
  const image = await geotiff.getImage();
  t.true(typeof geotiff === "object");
  t.true(typeof image === "object");
  t.is(image.getTileHeight(), 512);
  t.is(image.getTileWidth(), 512);
});

test("parsing Landsat 8 Scene with implicit Overview URL", async t => {
  const url =
    "https://landsat-pds.s3.amazonaws.com/c1/L8/024/030/LC08_L1TP_024030_20180723_20180731_01_T1/LC08_L1TP_024030_20180723_20180731_01_T1_B1.TIF";
  const geotiff = await from({ data: url, debug: false, ovr: true });
  const image = await geotiff.getImage();
  t.true(typeof geotiff === "object");
  t.true(typeof image === "object");
  t.is(image.getTileHeight(), 512);
  t.is(image.getTileWidth(), 512);
});

test("parsing Landsat 8 Scene with explicit Overview URL", async t => {
  const url =
    "https://landsat-pds.s3.amazonaws.com/c1/L8/024/030/LC08_L1TP_024030_20180723_20180731_01_T1/LC08_L1TP_024030_20180723_20180731_01_T1_B1.TIF";
  const ovrURL = url + ".ovr";
  const geotiff = await from({ data: [url, ovrURL], debug: false, ovr: true });
  const image = await geotiff.getImage();
  t.true(typeof geotiff === "object");
  t.true(typeof image === "object");
  t.is(image.getTileHeight(), 512);
  t.is(image.getTileWidth(), 512);
});

test("parsing geotiff from arrayBuffer", async t => {
  const buffer = fs.readFileSync("./data/geo.tif");
  const geotiff = await from({ data: buffer, debug: false, ovr: true });
  const image = await geotiff.getImage();
  t.true(typeof geotiff === "object");
  t.true(typeof image === "object");
  t.is(image.getTileHeight(), 3);
  t.is(image.getTileWidth(), 1208);
  t.is(image.getHeight(), 881);
  t.is(image.getWidth(), 1208);
});
