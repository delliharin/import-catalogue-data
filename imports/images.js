"use strict";

const fs = require("fs");
const Moltin = require("../moltin");
const path = require("path");
const FormData = require("form-data");

const moltin = new MoltinClient({
  client_id: process.env.NEW_SITE_CLIENT_ID,
  client_secret: process.env.NEW_SITE_SECRET
});

module.exports = async function(path, catalog) {
  //Primary Image	and Image 2
  const imagesM = await Moltin.Files.All();
  for (let image of catalog.inventory) {
    console.log("Uploading %s", image.image_link);
    const options = {
      url: image.image_link,
      //raw is a buffer
      encoding: null,
      resolveWithFullResponse: true
    };

    request.get(options, async (err, response, body) => {
      try {
        const formData = new FormData();
        //Name is import.  Make it something you can reference so you can estabilish product relationships
        formData.append("file_name", `${image.sku}-mainImage.jpg`);
        formData.append("public", "true");
        formData.append("file", body, { filename: fileName });
        const headers = {
          "Content-Type": formData.getHeaders()["content-type"]
        };

        const newFiles = await newMoltin.post(
          "files",
          { body: formData },
          headers
        );

        console.log(newFiles);
      } catch (error) {
        console.error(error);
      }
      //Any other files to send, just keep track of name, sku an easy key
    });
  }
};
