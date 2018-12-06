"use strict";

process.on("unhandledRejection", reason => console.error(reason));
const Moltin = require("./moltin");
const uploader = require("./data/uploader");
const objects = require("./data/moltinobjects");
const customobjects = require("./data/customobjects");
const transferobjects = require("./data/moltintransferobjects.js");
const argv = require("./argv");
require("dotenv").load();

const imports = {
  // order matters, do products last
  images: require("./imports/images"),
  collections: require("./imports/collections"),
  brands: require("./imports/brands"),
  categories: require("./imports/categories"),
  products: require("./imports/products")
};

const tranfer = {
  //order matters, do products last
  images: require("./transfers/images"),
  brands: require("./transfers/brands"),
  categories: require("./transfers/categories"),
  collections: require("./transfers/collections"),
  products: require("./transfers/products")
};

(async function() {
  //Delete only what is passed to delete
  for (let entity of [
    "Products",
    "Brands",
    "Categories",
    "Files",
    "Currency",
    "Collections"
  ]) {
    if (argv.clean(entity.toLowerCase())) {
      console.log("Catalog cleanup: removing %s", entity);
      await Moltin[entity].RemoveAll();
    }
  }

  if (argv.path !== "transfer") {
    //set up the object and transform
    const catalog = await uploader(argv.path);
    //set up flows
    await objects(argv.path, catalog);
    //Add data objects, unless flagged with skip
    for (let entity of Object.keys(imports)) {
      if (!argv.skip(entity)) {
        console.log("Importing %s", entity);
        await imports[entity](argv.path, catalog);
      }
    }
  } else {
    //transfer flows
    await transferobjects();
    //Transfer data, unless flagged with skip
    for (let entity of Object.keys(tranfer)) {
      if (!argv.skip(entity)) {
        console.log("Tranfering %s", entity);
        await tranfer[entity]();
      }
    }
  }

  console.log("New moltin catalog is ready to go");
})();
