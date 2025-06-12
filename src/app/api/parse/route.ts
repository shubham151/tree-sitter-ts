// src/app/api/parse/route.ts
import { NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: Request) {
  const { code } = await req.json();

  return new Promise((resolve, reject) => {
    console.log(path.resolve("scripts/dist/parse-runner.js"));
    const proc = spawn("node", [
      path.resolve("src/scripts/dist/parse-runner.js"),
    ]);

    let output = "";
    let error = "";

    proc.stdout.on("data", (data) => (output += data.toString()));
    proc.stderr.on("data", (data) => (error += data.toString()));
    proc.on("close", (code) => {
      if (code === 0) {
        resolve(NextResponse.json({ tree: output }));
      } else {
        reject(new Error(error || "Failed to parse"));
      }
    });

    proc.stdin.write(JSON.stringify({ code }));
    proc.stdin.end();
  });
}
