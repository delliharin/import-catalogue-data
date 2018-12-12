"use strict";

const Moltin = require("../moltin");
const fs = require("fs");

module.exports = async function(path, catalog) {
  var uniqueCategory = removeDuplicates(catalog.inventory, "category");

  for (let category of uniqueCategory) {
    console.log("Creating Category %s", category.category);

    //split based on delimantor
    var parentCategory = category.category.split(">");
    if (parentCategory[1]) {
      console.log("Creating category %s", parentCategory[0]);
      const categoryM = await Moltin.Categories.Create({
        type: "category",
        name: parentCategory[0],
        description: parentCategory[0],
        slug: parentCategory[0].replace(/[^A-Z0-9]/gi, "_"),
        status: "live"
      });

      console.log("next child", parentCategory[1]);

      //create Child
      const categoryChildM = await Moltin.Categories.Create({
        type: "category",
        name: parentCategory[1].replace(/[^A-Z0-9]/gi, ""),
        description: parentCategory[1],
        slug: parentCategory[1].replace(/[^A-Z0-9]/gi, ""),
        status: "live"
      });

      //Create relationships
      await Moltin.Categories.CreateRelationships(
        categoryM.data.id,
        "children",
        [
          {
            type: "category",
            id: categoryChildM.data.id
          }
        ]
      );
      if (parentCategory[2]);
      {
        console.log("2 child", parentCategory[2]);
        //create Child
        const categoryChildM = await Moltin.Categories.Create({
          type: "category",
          name: parentCategory[2].replace(/[^A-Z0-9]/gi, ""),
          description: parentCategory[1],
          slug: parentCategory[2].replace(/[^A-Z0-9]/gi, ""),
          status: "live"
        });

        //Create relationships
        await Moltin.Categories.CreateRelationships(
          categoryM.data.id,
          "children",
          [
            {
              type: "category",
              id: categoryChildM.data.id
            }
          ]
        );
      }
    } else {
      const categoryM = await Moltin.Categories.Create({
        type: "category",
        name: category.category,
        description: category.category,
        slug: category.category.replace(/[^A-Z0-9]/gi, "_"),
        status: "live"
      });
    }
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
