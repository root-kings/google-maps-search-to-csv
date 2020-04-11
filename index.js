const axios = require("axios");
const fs = require("fs");
// Enter your search string here
const search = "dayshmookh motel";

const key = "google-maps-api-key";

const query = search.split(" ").join("+");
let uri = `https://maps.googleapis.com/maps/api/place/textsearch/json?key=${key}&query=${query}`;

let filename = search.split(" ").join("_") + ".csv";
fs.writeFileSync(filename, "name,address,lat,lng\n");

let pageCounter = 0;

console.log("Query:", search);

function fetchData(opts) {
  let uritoget = uri;
  if (opts.next) uritoget += `&pagetoken=${opts.pagetoken}`;

  let pagetoken = null;

  //   console.log(uritoget);
  axios
    .get(uritoget)
    .then(response => {
      if (response.data.status == "OVER_QUERY_LIMIT")
        return console.log("Lol! Exceeded limit. Try later!");

      //   console.log(response.data);

      let results = response.data.results;
      pageCounter++;
      console.log("Page:", pageCounter);
      console.log("Results:", results.length);
      if (response.data.next_page_token)
        pagetoken = response.data.next_page_token;

      var stream = fs.createWriteStream(filename, { flags: "a" });
      results.forEach(result => {
        const { formatted_address, geometry, name } = result;
        stream.write(
          `"${name}", "${formatted_address}", ${geometry.location.lat}, ${geometry.location.lng}\n`
        );
      });
      stream.end();
    })
    .catch(console.error)
    .finally(() => {
      //   console.log(pagetoken);
      console.log("fetching next page in 5 secs...");
      if (pagetoken != null) {
        setTimeout(() => {
          fetchData({
            next: true,
            pagetoken
          });
        }, 5000);
      }
    });
}

fetchData({ next: false });
