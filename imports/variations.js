"use strict";

const Moltin = require("../moltin");
const fs = require("fs");

module.exports = async function(path, catalog) {
  var vartionId;

  const productIdParent = await client.get(
    `products/?filter=eq(itemgroupid,${product.itemgroupid.replace(
      /[^A-Z0-9]/gi,
      "_"
    )})`
  );

  console.log("making variation for product:", productIdParent.data[0].meta);
  //make a new variations
  console.log(productIdParent.data[0].meta.hasOwnProperty("variations"));
  if (productIdParent.data[0].meta.hasOwnProperty("variations")) {
    console.log(productIdParent.data[0].meta.variations[0].id);
    vartionId = productIdParent.data[0].meta.variations[0].id;
  } else {
    const variationData = {
      type: "product-variation",
      name: "attribute"
    };
    const variation = await client.post("/variations", variationData);
    vartionId = variation.data.id;
    console.log("product variation", vartionId);

    // Create the Product Relationships
    const relationshipData = [
      {
        type: "product-variation",
        id: vartionId
      }
    ];
    const relationships = await client.post(
      `products/${productIdParent.data[0].id}/relationships/variations`,
      relationshipData
    );
  }

  // Create the Variation options
  const optionData = {
    description: `Attribute: ${product.attribute}`,
    name: product.attribute,
    type: "option"
  };
  const optionId = await client.post(
    `variations/${vartionId}/options`,
    optionData
  );
  console.log("anything get optionId", optionId.data.id);

  //add modifiers, must do sku and slug
  const modifierDataSku = {
    type: "modifier",
    id: vartionId,
    modifier_type: "sku_append",
    value: `attribute_${product.attribute}`
  };

  const modifierSkuId = await client.post(
    `variations/${vartionId}/options/${optionId.data.id}/modifiers`,
    modifierDataSku
  );

  const modifierDataSlug = {
    type: "modifier",
    id: vartionId,
    modifier_type: "slug_append",
    value: `attribute_${product.attribute}`
  };

  const modifierSlugId = await client.post(
    `variations/${vartionId}/options/${optionId.data.id}/modifiers`,
    modifierDataSlug
  );

  //build
  const build = await client.post(
    `products/${productIdParent.data[0].id}/build`
  );
  console.log("anything get built", build);
};

//MARK
//IF there are multiple varians per product here is another option

//Way 1
// variation_keys = ["color", "size"]
// for (row in csv) {
//   for (key in row) {
//     if (key in variation_keys) {
//       row["variations"][key] = []
//       row["variations"][key].push(row[key])
//     }
//   }
// }
//
// // 2 variations 6 options
//
// {
//   "id": 1234,
//   "sku": "123",
//   "title": "product",
//   "variations": {
//     "color": [
//       "black",
//       "red"
//     ],
//     "size": [
//         "m",
//         "s",
//         "l"
//     ]
//   }
// }
//
// //this parent product has these variations and these modifiers
// //dictionary product , color: red, color: blue, size: m, size l
//  variations = {
//    color: [
//      'green',
//      'red'
//    ],
//    size: [
//      "l",
//      "m"
//    ]
//  }
//
//  for (key in variations) {
//    //create variation from key
//    modifiers = variations[key]
//    // create modifiers from array
//
//  }

//for dict color variation

//for dict size M
