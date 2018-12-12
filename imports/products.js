"use strict";

const _ = require("lodash");
const images = require("./images");
const Moltin = require("../moltin");
const variations = require("./variations");

const { createClient: MoltinClient } = require("@moltin/request");

const client = new MoltinClient({
  client_id: process.env.NEW_SITE_CLIENT_ID,
  client_secret: process.env.NEW_SITE_SECRET
});

module.exports = async function(path, catalog) {
  //Fetch catalog from moltin that should have been already imported from feed
  const categoriesM = await Moltin.Categories.All();
  const collectionM = await Moltin.Collections.All();
  const imagesM = await Moltin.Files.All();
  const brandsM = await Moltin.Brands.All();

  //Imported data
  const productsImport = catalog.inventory;
  //Create product from import

  //If there are variations you will want to create the parent product then go to variations to make all of the child products use removeDuplicates

  for (let product of productsImport) {
    // CREATE product
    var productUpload = {
      type: "product",
      name: product.name,
      //Slug can not have spaces or foreign characters
      slug: product.name.replace(/[^A-Z0-9]/gi, "_"),
      status: "live",
      price: [
        {
          amount: Number(product.price_m) * 100,
          currency: "USD",
          includes_tax: true
        }
      ],
      sku: product.sku,
      manage_stock: false,
      commodity_type: "physical",
      description: product.description,
      ...product
    };
    console.log(productUpload);
    let productM = await Moltin.Products.Create(productUpload);
    console.log("parent product made", productM.data.id);

    const categoriesToTie = categoriesM.meta.results.total;
    //TIE PRODUCT to Category
    if (categoriesToTie != 0) {
      //if there is a delimiter heirciery then split
      var parentCategory = product.category.split(">");
      var productsCategory = categoriesM.data.find(function(productsCategory) {
        return productsCategory.name === parentCategory[0];
      });

      await Moltin.Products.CreateRelationships(
        productM.data.id,
        "category",
        productsCategory.id
      );
    }
    //TIE PRODUCT to Collection
    const collectionToTie = collectionM.meta.results.total;
    if (collectionToTie != 0) {
      var productsCollection = collectionM.data.find(function(
        productsCollection
      ) {
        return productsCollection.name === product.product_type;
      });

      await Moltin.Products.CreateRelationships(
        productM.data.id,
        "collection",
        productsCollection.id
      );
    }

    //TIE PRODUCT to Brand
    const brandToTie = brandsM.meta.results.total;
    if (brandToTie != 0) {
      var productsbrand = brandsM.data.find(function(productsbrand) {
        return productsbrand.name === product.manufacturer;
      });

      await Moltin.Products.CreateRelationships(
        productM.data.id,
        "brand",
        productsbrand.id
      );
    }

    //images
    const imagesToTie = imagesM.meta.results.total;
    if (imagesToTie != 0) {
      //Need to format to match the file name used in images.js
      const imageName = productM.data.sku;
      console.log("Assigning image %s to %s", productM.data.id, imageName);
      // console.log("Assigning image %s to %s", JSON.stringify(imagesM));

      //TIE PRODUCT to MainImage
      var productsMainImage = imagesM.data.find(function(productsMainImage) {
        return productsMainImage.file_name === imageName;
      });

      console.log(
        "Assigning image %s to %s",
        productsMainImage,
        productM.data.id
      );
      await Moltin.Products.CreateRelationshipsRaw(
        productM.data.id,
        "main-image",
        {
          id: productsMainImage.id,
          type: "main_image"
        }
      );
    }
    // make a variation with the products
    // await transferobjects();
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

  console.log("Products import complete");
};
