#!/usr/bin/env node

require("dotenv").config();
var clear = require("clear");

//const http = require("./lib/http.js").webInterfacePost;
const readline = require("readline");
const { webInterfacePost } = require("./lib/http.js");
let instance = {};

class CliInterface {
  constructor(cliInstance) {
    this.cliPrompt = cliInstance;
  }

  createCLI() {
    this.cliPrompt = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: "Input roman number to convert. Input exit/quit to exit prompt: ",
    });

    this.cliPrompt.prompt();
  }

  attachCLI() {
    const decodeInputOnServer = async (input) => {
      try {
        return await webInterfacePost(
          `${process.env.APP_URL}:${process.env.APP_SERVER_PORT}`,
          { data: input }
        );
      } catch (e) {
        console.log(e);
      }
    };

    this.cliPrompt.on("line", async (line) => {
      if (line.toLowerCase() === "exit" || line.toLowerCase() === "quit")
        process.exit(0);

      try {
        let result = await decodeInputOnServer(line);
        
        let msg;
        switch (result.statusCode) {
          case 200:
            msg = `The numeral equilevant of ${line} is ${result.input.data.convertedChar}`;
            break;
          case 404:
            msg = `The input ${line} was not accepted, Please input a valid string`;
            break;
          case 500:
            msg = "Internal server error. Please try again later";
            break;
        }
        console.log(msg);
      } catch (e) {
        console.error(e);
        process.exit(1);
      }
      this.cliPrompt.prompt();
    });
  }
}

const run = () => {
  try {
    instance = new CliInterface();
    instance.createCLI();
    instance.attachCLI();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};
clear();
run();
