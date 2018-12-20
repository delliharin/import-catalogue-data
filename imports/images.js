"use strict";

const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
var request = require("request");

const { createClient: MoltinClient } = require("@moltin/request");

module.exports = async function(path, catalog) {
  const moltin = new MoltinClient({
    client_id: process.env.NEW_SITE_CLIENT_ID,
    client_secret: process.env.NEW_SITE_SECRET
  });
  //Primary Image	and Image 2
  for (let image of catalog.inventory) {
    console.log("Uploading %s", image.image_url);
    const fileName = image.sku;
    const fileLink = image.image_url;

    const options = {
      url: fileLink,
      //raw is a buffer
      encoding: null,
      resolveWithFullResponse: true
    };

    request.get(options, async (err, response, body) => {
      try {
        const formData = new FormData();
        formData.append("file_name", fileName);
        formData.append("public", "true");
        formData.append("file", body, { filename: fileName });
        const headers = {
          "Content-Type": formData.getHeaders()["content-type"]
        };

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
