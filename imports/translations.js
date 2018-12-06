"use strict";

const Moltin = require("../moltin");
const fs = require("fs");

module.exports = async function(path, catalog) {
  //use a key for look up parent product
  const productIdParent = await client.get(
    `products/?filter=eq(sku,${product.vsn.replace(/[^A-Z0-9]/gi, "_")})`
  );

  //update name and desc based on translation file
  const updatedData = {
    type: "product",
    id: productIdParent.data[0].id,
    name: product.description_fr,
    description: product.description_fr
  };

  const updateDesc = await client.put(
    `products/${productIdParent.data[0].id}`,
    updatedData
  );
  console.log(updateDesc);
};
