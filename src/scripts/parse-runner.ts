// scripts/parse-runner.ts
const Parser = require("tree-sitter");
const { typescript } = require("tree-sitter-typescript");

const main = async () => {
  const input = await new Promise<string>((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });

  const { code } = JSON.parse(input);
  const parser = new Parser();
  parser.setLanguage(typescript);

  const tree = parser.parse(code);
  console.log(tree.rootNode.toString());
};

main();
