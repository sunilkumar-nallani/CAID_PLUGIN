async function interact() {
  const [deployer] = await ethers.getSigners();
  const Registry = await ethers.getContractFactory("ImageVerdictRegistry");
  const registry = await Registry.attach("DEPLOYED_CONTRACT_ADDRESS");

  await registry.recordVerdict("real");
  const verdict = await registry.getVerdict(1);
  console.log("Verdict #1:", verdict);
}

interact().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});