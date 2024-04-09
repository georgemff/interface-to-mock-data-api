import { Injectable } from "@nestjs/common";
import { ConverterRequestDto } from "./dto";
import * as FIRST_NAMES from "../data/first-names.json";
import * as LAST_NAMES from "../data/first-names.json";
import {
  uniqueNamesGenerator,
  adjectives,
  colors
} from "unique-names-generator";
import { LoremIpsum } from "lorem-ipsum";

/*
enum CustomTypes {
  FIRST_NAME = 'FIRST_NAME',
  LAST_NAME = 'LAST_NAME',
  NICK_NAME = 'NICK_NAME',
  DESCRIPTION = 'DESCRIPTION',
  EMAIL = 'EMAIL',
}
*/

@Injectable()
export class ConverterService {
  private descriptionLorem = new LoremIpsum({
    wordsPerSentence: {
      min: 4,
      max: 20
    }
  });

  private randomStringLorem = new LoremIpsum({
    wordsPerSentence: {
      min: 2,
      max: 10
    }
  });

  private primitiveTypes: string[] = [
    "number",
    "string",
    "boolean",
    "undefined",
    "null"
  ];

  private emailDomains: string[] = [
    "@gmail.com",
    "@outlook.com",
    "@yahoo.com",
    "@icloud.com"
  ];

  convertInterface(dto: ConverterRequestDto): any {
    const parsed = this.parseDtoString(dto.interface);

    const mainInterface = parsed[0];
    parsed.shift();

    const response = [];
    const maxLength = dto.count > 200 ? 200 : dto.count;

    for (let c = 0; c < maxLength; c++) {
      const fakeObj = this.generateData(mainInterface, parsed);
      if (fakeObj) {
        response.push(fakeObj);
      }
    }
    return response;
  }

  private generateData(mainInterface: string, interfacesArray: string[]): any {
    try {
      const interfaceObject = {};

      // let mainInterface = interfacesArray[0];
      mainInterface = this.removeInterfaceName(mainInterface);
      mainInterface = this.removeFirstAndLastBraces(mainInterface);
      const splitted = this.splitInterfacePropertyes(mainInterface).filter(
        (el) => el
      );

      splitted.forEach((el) => {
        const [prop, type] = el.split(":").map((e) => e.trim());
        let isTypeOfArray = false;
        if (type.trim().slice(-2) === "[]") {
          isTypeOfArray = true;
        }
        if (type === "undefined" || type === "null") {
          interfaceObject[prop] = type;
        } else if (
          this.primitiveTypes.includes(type) ||
          type.includes("CustomTypes") || (isTypeOfArray && this.primitiveTypes.includes(type.slice(0, -2)))
        ) {
          let randomValue = isTypeOfArray ? [] : undefined;

          if (isTypeOfArray) {
            for (let i = 0; i < 10; i++) {
              randomValue.push(this.getPrimitiveRandomValue(type.slice(0, -2)));
            }
          } else {
            randomValue = this.getPrimitiveRandomValue(type);
          }

          interfaceObject[prop] = randomValue;

        } else {
          //TODO: generate multiple data if property is type of List<Interface>

          const intertaceExists = interfacesArray.filter((el) => {
            const i = el.indexOf("{");
            if (isTypeOfArray) {
              return el.slice(0, i).trim() === type.slice(0, -2);
            }
            return el.slice(0, i).trim() === type;
          });

          if (intertaceExists.length) {
            if (isTypeOfArray) {
              interfaceObject[prop] = [];
              for (let i = 0; i < 10; i++) {
                interfaceObject[prop].push(
                  this.generateData(intertaceExists[0], interfacesArray)
                );
              }
            } else {
              interfaceObject[prop] = this.generateData(
                intertaceExists[0],
                interfacesArray
              );
            }
          }
        }
      });

      return interfaceObject;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  private getPrimitiveRandomValue(type): any {
    switch (type) {
      case "string":
      case "CustomTypes.FIRST_NAME":
      case "CustomTypes.LAST_NAME":
      case "CustomTypes.NICK_NAME":
      case "CustomTypes.DESCRIPTION":
      case "CustomTypes.EMAIL":
        if (this.isTypeLastName(type)) {
          return LAST_NAMES[this.getRandomIndex(0, FIRST_NAMES.length - 1)];
        } else if (this.isTypeUserName(type)) {
          return uniqueNamesGenerator({
            dictionaries: [adjectives, colors],
            separator: "-",
            length: 2
          });
        } else if (this.isTypeFirstName(type)) {
          return FIRST_NAMES[this.getRandomIndex(0, LAST_NAMES.length - 1)];
        } else if (this.isTypeEmail(type)) {
          return `example${this.emailDomains[this.getRandomIndex(0, this.emailDomains.length - 1)]}`;
        } else if (this.isTypeDescription(type)) {
          return this.descriptionLorem.generateSentences();
        } else {
          return this.randomStringLorem.generateWords();
        }
      case "number":
        return Math.round(Math.random() * 10);
      case "boolean":
        return !!Math.round(Math.random());
      default:
        return undefined;
    }
  }

  private parseDtoString(str: string): string[] {
    try {
      //remove possible comments from code string
      str = str.replace(/\/\*[\s\S]*?\*\/|(?<=[^:])\/\/.*|^\/\/.*/g, "");
      let stringsArr = str.split("interface");
      stringsArr = stringsArr
        .map(i => i.trim())
        .map(i => i.replace(/\n|\s/g, ""))
        .filter(i => !!i);


      const interfacesCount = stringsArr.length;
      for (let i = 0; i < interfacesCount; i++) {
        if (!this.validateInterface(stringsArr[i])) {
          return [];
        }
      }

      return stringsArr;
    } catch (error) {
      return [];
    }
  }

  private validateInterface(str: string): boolean {
    const countOpeningBraces = (str.match(/{/g) || []).length;
    const countClosingBraces = (str.match(/}/g) || []).length;
    return (
      countOpeningBraces > 0 &&
      countClosingBraces > 0 &&
      countOpeningBraces === countClosingBraces
    );
  }

  private removeInterfaceName(intString: string): string {
    const indexOfCurlyBraces = intString?.indexOf("{");

    if (!indexOfCurlyBraces) return undefined;

    return intString.slice(indexOfCurlyBraces);
  }

  private removeFirstAndLastBraces(str: string): string {
    if (!str) return "";

    str = str.substring(1);
    str = str.substring(0, str.length - 1);
    return str;
  }

  private splitInterfacePropertyes(str: string): string[] {
    //split it with comma or semicolon depending on what user has used in interface
    if (!str) return [];

    return str
      .split(",")
      .map((e) => e.split(";"))
      .flat();
  }

  private isTypeLastName(type: string): boolean {
    return type === "CustomTypes.LAST_NAME";
  }

  private isTypeUserName(type: string): boolean {
    return type === "CustomTypes.NICK_NAME";
  }

  private isTypeFirstName(type: string): boolean {
    return type === "CustomTypes.FIRST_NAME";
  }

  private isTypeEmail(type: string): boolean {
    return type === "CustomTypes.EMAIL";
  }

  private isTypeDescription(type: string): boolean {
    return type === "CustomTypes.DESCRIPTION";
  }

  private getRandomIndex(min = 0, max): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
}
