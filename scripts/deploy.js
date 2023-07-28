const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const MessagingPlatform = await hre.ethers.getContractFactory("MessagingPlatform");
  const messagingPlatform = await MessagingPlatform.deploy();
  await messagingPlatform.deployed();
  console.log("messagingPlatform deployed to:", messagingPlatform.address);

  fs.writeFileSync('./config.js', `
  export const platformAddress = "${messagingPlatform.address}"
  `)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
