"use strict";

const Moltin = require("../moltin");
const fs = require("fs");

const { createClient: MoltinClient } = require("@moltin/request");

const oldSite = new MoltinClient({
  client_id: process.env.OLD_SITE_CLIENT_ID
});

const newSite = new MoltinClient({
  client_id: process.env.NEW_SITE_CLIENT_ID,
  client_secret: process.env.NEW_SITE_SECRET
});

module.exports = async function() {
  var flowId;
  //get a products To Check flows
  const oldProducts = await oldSite.get("products?page[limit]=1");
  const productFlow = await newSite.get("flows");

  if (Object.keys(productFlow).id == "undefined") {
    //create flow for Products
    var data = {
      type: "flow",
      name: "Products flow",
      slug: "products",
      description: "Extends the default product object",
      enabled: true
    };
    const productFlow = await newSite.post("flows", data);
    flowId = productFlow.data.id;
  } else {
    flowId = productFlow.data[0].id;
  }
  var fields = Object.keys(oldProducts.data[0]);
  console.log(productFlow);
  //make fields
  //if field is going to be a core object do not use
  //detmineistic

  var flowFields = fields.filter(checker);
  for (let field of flowFields) {
    if (field != "") {
      console.log(field);
      console.log(flowId.replace(/"/g, ""));

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
              id: flowId.replace(/"/g, "")
            }
          }
        }
      };
      //call API
      const response = await newSite.post("fields", data);
      console.log(response);
    }
  }

  //add in defualt moltin fields
  function checker(value) {
    var moltinObjects = [
      "price",
      "name",
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
      "main_image"
    ];

    for (var i = 0; i < moltinObjects.length; i++) {
      if (value.indexOf(moltinObjects[i]) > -1) {
        return false;
      }
    }
    return true;
  }
};
