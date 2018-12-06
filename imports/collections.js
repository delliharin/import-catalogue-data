"use strict";

const Moltin = require("../moltin");
const fs = require("fs");

module.exports = async function(path, catalog) {
  var uniqueCollection = removeDuplicates(catalog.inventory, "product_type");
  for (let collection of uniqueCollection) {
    console.log("Creating collection %s", collection.product_type);
    const collectionM = await Moltin.product_type.Create({
      type: "collection",
      name: collection.product_type,
      description: collection.product_type,
      slug: collection.product_type.replace(/[^A-Z0-9]/gi, "_"),
      status: "live"
    });
  }

  function removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }
};
