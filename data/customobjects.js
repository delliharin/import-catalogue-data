"use strict";

const Moltin = require("../moltin");
const fs = require("fs");
const { createClient: MoltinClient } = require("@moltin/request");

const client = new MoltinClient({
  client_id: process.env.NEW_SITE_CLIENT_ID,
  client_secret: process.env.NEW_SITE_SECRET
});

module.exports = async function(path, catalog) {
  // const flows = await client.get("flows");
  //pass in your custom flow id
  const flowId = "";
  if (flowId === "") {
    //create flow for Products
    var data = {
      type: "flow",
      name: "Custom flow",
      slug: "region_avaibility",
      description: "Stores information about product availability",
      enabled: true
    };
    const productFlow = await client.post("flows", data);
  } else {
    var fields = Object.keys(catalog.inventory[0]);
    console.log(fields);
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
                id: flowId.replace(/"/g, "")
              }
            }
          }
        };
        //call API
        const response = await client.post("fields", data);
        console.log(response);
      }
    }
  }

  //add in defualt moltin fields
  function checker(value) {
    var moltinObjects = ["id", "brand", "category", "sku", "regular_price"];

    for (var i = 0; i < moltinObjects.length; i++) {
      if (value.indexOf(moltinObjects[i]) > -1) {
        return false;
      }
    }
    return true;
  }
};
