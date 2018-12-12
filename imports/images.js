"use strict";

const fs = require("fs");
// const Moltin = require("../moltin");
const path = require("path");
const FormData = require("form-data");
var request = require("request");

const { createClient: MoltinClient } = require("@moltin/request");

module.exports = async function(path, catalog) {
  const moltin = new MoltinClient({
    client_id: process.env.NEW_SITE_CLIENT_ID,
    client_secret: process.env.NEW_SITE_SECRET
  });
  console.log("moltin", moltin);
  //Primary Image	and Image 2
  for (let image of catalog.inventory) {
    console.log("Uploading %s", image.image_url);
    const fileName = image.sku;
    const fileLink = image.image_url;
    console.log("fileLink", fileLink);

    const options = {
      url: fileLink,
      //raw is a buffer
      encoding: null,
      resolveWithFullResponse: true
    };
    console.log("file options", options);

    request.get(options, async (err, response, body) => {
      try {
        const formData = new FormData();
        formData.append("file_name", fileName);
        formData.append("public", "true");
        formData.append("file", body, { filename: fileName });
        const headers = {
          "Content-Type": formData.getHeaders()["content-type"]
        };
        console.log("headers", headers);
        console.log("formData", formData);

        const newFiles = await moltin.post(
          "files",
          { body: formData },
          headers
        );
        console.log(newFiles);
      } catch (error) {
        console.error(error);
      }
    });
  }
};
