const { projectId } = require("./secrets.json")

module.exports = {
  node: {
    fork: `https://ropsten.infura.io/v3/${projectId}`,
  },
};
