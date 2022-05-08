const superagent = require("superagent")
const token = require('../../db/models/token')

async function getData(url = '', bearerToken = undefined) {
  let accessToken = await token.findOne({ id: 2 })

  return await superagent
    .get(url)
    .set('Authorization', `Bearer ${bearerToken || accessToken.code}`)
    .then((res) => {
      return res.body;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

async function postData(url = "", body = {}) {
  return await superagent
    .post(url)
    .send(body)
    .set("Accept", "application/json")
    .set("Content-Type", "application/json")
    .then((res) => {
      return res.body;
    })
    .catch((err) => {
      console.log(err);
      return false;
    });
}

module.exports = { getData, postData };
