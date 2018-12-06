## Usage

To create your catalog in Moltin you'll need [node.js](https://nodejs.org/en/)

* Sign up for Moltin and create a new store. Go to the store settings to get your API keys.

* Set up two environment variables

```
export MOLTIN_CLIENT_ID="XXXXX"
export MOLTIN_CLIENT_SECRET="XXXXX"
```

* Install packages

```
npm install
```

* Run `app.js` and supply the path to your data file as a command line argument

```
node app.js "/Users/<yourself>/Downloads/apparel.csv"
```


If you are re-running the script, you can selectively skip certain steps or require that a script first cleans up your store:

```
node app.js "path" --delete=<entity> --delete=<another entity> --skip=<step> --skip=<another step>
```

You can clean: `products`, `categories`, `brands`, and `files` (images). To request that multiple entities be cleaned please use `--delete=<entity>` for each entity.
