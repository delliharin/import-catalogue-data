"use strict";

const Moltin = require("../moltin");
const fs = require("fs");

module.exports = async function(path, catalog) {
  var uniqueCollection = removeDuplicates(catalog.inventory, "collection");
  for (let collection of uniqueCollection) {
    console.log("Creating collection %s", collection.collection);
    const collectionM = await Moltin.Collections.Create({
      type: "collection",
      name: collection.collection,
      description: collection.collection,
      slug: collection.collection.replace(/[^A-Z0-9]/gi, "_"),
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
