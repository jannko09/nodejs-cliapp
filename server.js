#!/usr/bin/env node

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();

app.use(bodyParser.json());

app.post("/", (req, res) => {
  let payload = req.body.value;
  let payloadFormatted = inputHandler(payload.data);
  let statusCode = 200;

  statusCode = payloadFormatted.testPass ? 200 : 404;
  res.status(statusCode).send({ data: payloadFormatted });
});

process.env.APP_SERVER_PORT;
app.listen(process.env.APP_SERVER_PORT, () => {
  console.log(`Roman character server listening at http://localhost:${process.env.APP_SERVER_PORT}`);
});

inputHandler = (userInput) => {
  const trimUserInput = userInput.replace(/\s/g, "");

  //return if no input
  if (trimUserInput == "") return { testPass: false, data: null };

  //Replace empty and convert input to array with Uppercase characters
  const inputToComparable = [...trimUserInput].map((char) =>
    char.toUpperCase()
  );

  //Validate that userinput string matches roman numerals
  validateUserInput = (input, comparison) => {
    let convertedChar = "";
    let testPass = true;
    for (let i = 0; input.length > i; i++) {
      if (comparison.indexOf(input[i]) >= 0) {
        convertedChar += input[i];
        testPass = true;
        continue;
      } else {
        testPass = false;
        convertedChar = input[i];
        break;
      }
    }
    return { testPass, convertedChar };
  };

  //Validate that userinput follows rules for roman numerals
  //Säännöt 1 ja 2
  validateCorrectConcurrence = (validatedInput) => {
    let testPass = validatedInput.testPass;

    //if previous arg.testPass is fail we know that previous step failed, Thus return
    if (testPass === false) return validatedInput;

    //validate if correct maxConcerrence when more than 1 char
    if (validatedInput.convertedChar.length > 0) {
      let arrayToTest = [...validatedInput.convertedChar];
      //first char in initial loop
      let prevChar = arrayToTest[0];
      let charCounter = 0;
      let convertedChar = "";

      for (let i = 0; arrayToTest.length > i; i++) {
        convertedChar += arrayToTest[i];

        //-1 because start from zero
        let occurrenceAmount =
          romanNumeralsEnum[arrayToTest[i]].maxConcerrence - 1;

        //the amount of max concurrent characters of present index below
        //if prev loop different from this loop.. we know that different char and zero charcounter
        //if charCounter equals characters respective max amount, the concurrent rule fails the test
        if (charCounter > occurrenceAmount && arrayToTest[i] === prevChar) {
          testPass = false;
          break;
        }

        //prevChar is empty on first iteration. Increase counter on first loop
        //concurrent char if match prevChar
        if (arrayToTest[i] === prevChar || prevChar === "") {
          charCounter += 1;
        } else {
          charCounter = 1;
        }
        prevChar = arrayToTest[i];
      }

      return { testPass: testPass, convertedChar: convertedChar };
    }
  };

  //Validate that userinput has correct characters in correctorder
  //Säännöt 3, 4, 5
  transformValidatedRomanToInteger = (validatedInput) => {
    let testPass = validatedInput.testPass;

    //if previous arg.testPass is fail we know that previous step failed, Thus return
    if (testPass === false) return validatedInput;

    let romanKeys = Object.keys(romanNumeralsEnum);
    let romanNumeralInInteger = 0;
    let indexOrder = [];

    // sääntö 3
    // romanKeys has romannumerals arranged in index order
    // first convert userinput into a list of indexes so we know the order of roman numerals in userinput
    let arrayToTest = [...validatedInput.convertedChar];
    for (let i = 0; arrayToTest.length > i; i++) {
      indexOrder.push(romanKeys.indexOf(arrayToTest[i]));
    }

    let calculusArray = [];
    let lessThanZero = false;
    for (let i = 0; indexOrder.length > i; i++) {
      let romanCharFromIndex = romanKeys[indexOrder[i]];
      let romanCharToInteger = romanNumeralsEnum[romanCharFromIndex].value;

      //input is bad format if two negative in a row
      if (romanCharToInteger < 1) {
        if (lessThanZero) {
          testPass = false;
          break;
        }
      } else {
        lessThanZero = false;
      }

      if (indexOrder[i] < indexOrder[i + 1]) {
        calculusArray.push(-romanCharToInteger);
      } else {
        calculusArray.push(romanCharToInteger);
      }
    }
    //calculusArray array has each roman literal now and depending on their order they get + / - operator
    //now we can deduct the total by mapping adequate roman character to int

    console.log(calculusArray);
    var prevValLessThanZero = false;

    const reducer = (accumulator, item) => {
      //if any item plus counter part equal zero we know that they are counterparts
      //e.g (-1 + 1 = 0) + 5 = 5 => fail because equals IIV
      if (calculusArray.some((x) => x + item === 0)) {
         testPass = false;
      }

      if(item < 0 && prevValLessThanZero){
        testPass = false;
      }
      
      if(item < 0){
        prevValLessThanZero = true;
      } else {
        prevValLessThanZero = false;
      }


      return accumulator + item;
    };

    romanNumeralInInteger = calculusArray.reduce(reducer, 0);
    //if we have two same value with different operators we know that input is wrong
    //e.g c [1,-1, 10] = I I X ==> reduder calcs 1 - 1 + 10
    //so fail test if two of the same values with
      return { testPass: testPass, convertedChar: romanNumeralInInteger };
  };

  //sääntö 1 Roomalaisia numeroita (I,X,C,M) saa olla enintään 3 peräkkäin.
  //sääntö 2 Roomalaisia numeroita (V,L,D) saa olla enintään 1 peräkkäin.
  //sääntö 3 Roomalaista numeroa seuraa pienempi luku => luku lisätään Roomalaiseen numeroon.
  //sääntö 4 Roomalaista numeroa seuraa sama luku => luku lisätään Roomalaiseen numeroon.
  //sääntö 5 Roomalaista numeroa edeltää pienempi luku => luku miinustetaan Roomalaisesta numerosta.

  //lähde: https://mervi2016.wordpress.com/laskusaantoja/roomalaiset-numerot/

  //https://fi.wikipedia.org/wiki/Roomalaiset_numerot#Taulukko_roomalaisista_numeroista
  const romanNumeralsEnum = {
    I: { value: 1, maxConcerrence: 3 },
    V: { value: 5, maxConcerrence: 1 },
    X: { value: 10, maxConcerrence: 3 },
    L: { value: 50, maxConcerrence: 1 },
    C: { value: 100, maxConcerrence: 3 },
    D: { value: 500, maxConcerrence: 1 },
    M: { value: 1000, maxConcerrence: 3 },
  };

  //the return value is constructed by taking user input through *rules for roman characters
  //*rules are imperative functions that return boolean testPass and convertedChar
  //steps:

  // 1)
  // indexed array of roman literals
  // converts userinput to array of uppercase characters
  const convertedUserInput = validateUserInput(
    inputToComparable,
    Object.keys(romanNumeralsEnum)
  );

  // 2)
  // validate that character amounts do not exceed their limitations *maxConcurrence*
  const validatedCharacters = validateCorrectConcurrence(convertedUserInput);
  console.log("----------------------");
  console.log(validatedCharacters);
  console.log("----------------------");

  // 3)
  // transform validated characters to their integer value
  console.log("==============================");
  console.log("inputted value equals");
  const romanToInteger = transformValidatedRomanToInteger(validatedCharacters);
  console.log(romanToInteger.convertedChar);
  console.log("==============================");

  return romanToInteger;
};
