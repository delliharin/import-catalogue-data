"use strict";

const Moltin = require("../moltin");
const fs = require("fs");

module.exports = async function(path, catalog) {
  var uniqueBrand = removeDuplicates(catalog.inventory, "manufacturer");

  for (let brand of uniqueBrand) {
    //split based on delimantor
    console.log("Creating brand %s", brand.manufacturer);
    const brandM = await Moltin.Brands.Create({
      type: "brand",
      name: brand.manufacturer,
      description: brand.manufacturer,
      slug: brand.manufacturer.replace(/[^A-Z0-9]/gi, "_"),
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
