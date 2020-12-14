const fetch = require("node-fetch");

const webInterfacePost = async (url = "", data = null) => {
  const response = await fetch(url, {
    method: "post",
    body: JSON.stringify({ value: data }),
    headers: { "Content-Type": "application/json" },
  });
  return { input: await response.json(), statusCode: response.status };
};

module.exports = { webInterfacePost };
