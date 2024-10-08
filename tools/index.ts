async function main() {
  const args = process.argv.slice(2);
  if (args.length == 0) {
    throw new Error("Need to specify a module to launch.");
  }

  const submodule = await import(`./modules/${args[0]}.js`);
  submodule.handler(args.slice(1));
}

main();