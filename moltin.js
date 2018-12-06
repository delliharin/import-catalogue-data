"use strict";

const fs = require("fs");
const request = require("request-promise-native");
require("dotenv").load();

const MoltinGateway = require("@moltin/sdk").gateway;

const Moltin = MoltinGateway({
  client_id: process.env.NEW_SITE_CLIENT_ID,
  client_secret: process.env.NEW_SITE_SECRET
});

/*
  Exposing the authenticate
*/
const authenticate = async function(storage) {
  const expired =
    !storage.get("mtoken") || Date.now().toString() >= storage.get("mexpires");

  return expired ? await Moltin.Authenticate() : undefined;
};

const relate = function(id, type, resources) {
  console.log("resiurces", resources);
  return this.request.send(
    `${this.endpoint}/${id}/relationships/${type}`,
    "POST",
    resources
  );
};

Moltin.Categories.CreateRelationships = relate;
Moltin.Products.CreateRelationshipsRaw = relate;

/*
Recursively delete all records to clean up the catalog
*/
const removeAll = function() {
  const clean = async () => {
    const { data, meta } = await this.All();
    const total = meta && meta.results ? meta.results.total : data.length;
    const current = data.length;

    console.log("Processing the first %s of %s total", current, total);
    for (let item of data) {
      console.log(
        "Requesting a delete of %s - %s",
        item.name || item.code,
        item.id
      );

      try {
        await this.Delete(item.id);
      } catch (error) {
        if (Array.isArray(error)) {
          error.forEach(console.error);
        } else {
          console.error(error);
        }
      }
    }

    return total > current ? await clean() : undefined;
  };

  return clean();
};

//Delete all
Moltin.Categories.RemoveAll = removeAll;

Moltin.Brands.RemoveAll = removeAll;
Moltin.Products.RemoveAll = removeAll;
Moltin.Currencies.RemoveAll = removeAll;

Moltin.Files = Object.setPrototypeOf(
  Object.assign({}, Moltin.Products),
  Moltin.Products
);
Moltin.Files.endpoint = "files";

Moltin.Files.Create = async function(file) {
  const { config, storage } = this.request;

  await authenticate(storage);

  const url = `${config.protocol}://${config.host}/${config.version}`;

  const response = await request({
    uri: `${url}/${this.endpoint}`,
    method: "POST",
    headers: {
      Authorization: `Bearer: ${storage.get("mtoken")}`,
      "Content-Type": "multipart/form-data",
      "X-MOLTIN-SDK-LANGUAGE": config.sdk.language,
      "X-MOLTIN-SDK-VERSION": config.sdk.version
    },
    formData: {
      public: "true",
      file_name: file.replace(/.+\//, ""),
      file: fs.createReadStream(file)
    }
  });

  return JSON.parse(response);
};
Moltin.Files.RemoveAll = removeAll;

module.exports = Moltin;
