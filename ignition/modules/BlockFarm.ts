import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("BlockFarmModule", (m) => {
  const blockFarm = m.contract("BlockFarm");

  return { blockFarm };
});