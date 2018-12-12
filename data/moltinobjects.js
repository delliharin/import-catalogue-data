"use strict";

const Moltin = require("../moltin");
const fs = require("fs");
const { createClient: MoltinClient } = require("@moltin/request");

const client = new MoltinClient({
  client_id: process.env.NEW_SITE_CLIENT_ID,
  client_secret: process.env.NEW_SITE_SECRET
});

module.exports = async function(path, catalog) {
  var flowId;
  const flows = await client.get("flows");
  var flowId;
  if (flowId === "") {
    //create flow for Products
    var data = {
      type: "flow",
      name: "Products flow",
      slug: "products",
      description: "Extends the default product object",
      enabled: true
    };
    const productFlow = await client.post("flows", data);
    flowId = productFlow.data.id;
  } else {
    flowId = flows.data[0].id;
  }

  var fields = Object.keys(catalog.inventory[0]);
  console.log(flowId);

  //make fields
  //if field is going to be a core object do not use
  //detmineistic
  var flowFields = fields.filter(checker);
  for (let field of flowFields) {
    if (field != "") {
      console.log(field);
      const data = {
        type: "field",
        name: field.replace(/[^A-Z0-9]/gi, "_"),
        unique: false,
        default: 0,
        slug: field.replace(/[^A-Z0-9]/gi, "_"),
        description: `Custom field for: ${field}`,
        enabled: true,
        field_type: "string",
        required: false,
        relationships: {
          flow: {
            data: {
              type: "flow",
              id: flowId
            }
          }
        }
      };
      //call API
      const response = await client.post("fields", data);
      console.log(response);
    }
  }
};

//add in defualt moltin fields.  This is just a general list.  You may need to adjust.
function checker(value) {
  var moltinObjects = [
    "price",
    "title",
    "sku",
    "slug",
    "type",
    "id",
    "status",
    "commodity_type",
    "meta",
    "stock",
    "relationships",
    "manage_stock",
    "description",
    "main_image",
    "relationships",
    "brand",
    "gtin",
    "image_link",
    "product_type",
    "category",
    "cost",
    "image_url",
    "name"
  ];

  for (var i = 0; i < moltinObjects.length; i++) {
    if (value.indexOf(moltinObjects[i]) > -1) {
      return false;
    }
  }
  return true;
}
