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

    //Name is import.  Make it something you can reference so you can estabilish product relationships
    const formData = new FormData();
    formData.append("file_name", `${image.sku}-mainImage.jpg`);
    formData.append("public", "true");
    formData.append("file", body, { filename: fileName });
    const newFiles = await moltin.post("files", { body: formData }, headers);
    //Any other files to send, just keep track of name, sku an easy key
  }
};
