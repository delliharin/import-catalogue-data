"use strict";

const _ = require("lodash");
const images = require("./images");
const Moltin = require("../moltin");

const { createClient: MoltinClient } = require("@moltin/request");

const oldSite = new MoltinClient({
  client_id: process.env.OLD_SITE_CLIENT_ID
});

const newSite = new MoltinClient({
  client_id: process.env.NEW_SITE_CLIENT_ID,
  client_secret: process.env.NEW_SITE_SECRET
});
module.exports = async function(path, catalog) {
  //Fetch catalog form moltin that should have been already imported from feed
  const categoriesM = (await Moltin.Categories.All()).data;
  const brandsM = (await Moltin.Brands.All()).data;
  const imagesM = (await Moltin.Files.All()).data;

  const productsImport = catalog.inventory;

  //Create product from import
  var productName;
  var productDesc;
  var productPrice;
  var uniqueProducts = removeDuplicates(catalog.inventory, "vsn");

  for (let product of productsImport) {
    // CREATE product
    console.log("sku empty", product.sku_hr);
    if (product.styleName_en !== "") {
      productName = product.styleName_en;
    } else if (product.brand_en !== "") {
      productName = product.brand_en;
    } else {
      productName = "placeHolder";
    }
    if (product.description_en == "") {
      productDesc = "placeholder Desc";
    } else {
      productDesc = product.description_en;
    }

    var productUpload = {
      type: "product",
      name: productName,
      //Slug can not have spaces or foreign characters
      slug: product.vsn.replace(/[^A-Z0-9]/gi, "_"),
      status: "live",
      price: [
        {
          amount: Number(product.price_hr) * 100,
          currency: "USD",
          includes_tax: true
        }
      ],
      sku: product.vsn.replace(/[^A-Z0-9]/gi, "_"),
      manage_stock: false,
      commodity_type: "physical",
      description: productDesc,
      ...product
    };
    let productM = await Moltin.Products.Create(productUpload);
    console.log("parent product made", productM.data.id);

    //TIE PRODUCT to Category
    var productsCategory = categoriesM.find(function(productsCategory) {
      return productsCategory.name === product.category;
    });

    await Moltin.Products.CreateRelationships(
      productM.data.id,
      "category",
      productsCategory.id
    );

    var productsbrand = brandsM.find(function(productsbrand) {
      return productsbrand.name === product.brand_en;
    });

    await Moltin.Products.CreateRelationships(
      productM.data.id,
      "brand",
      productsbrand.id
    );
    //make a variation with the products
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

  function isEmpty(value) {
    return (
      (typeof value == "string" && !value.trim()) ||
      typeof value == "undefined" ||
      value === null
    );
  }

  console.log("Products import complete");
};
