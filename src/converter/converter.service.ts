import { Injectable } from '@nestjs/common';
import { ConverterRequestDto } from './dto';
import * as FIRST_NAMES from "../data/first-names.json";
import * as LAST_NAMES from "../data/first-names.json";
import { uniqueNamesGenerator, Config, adjectives, colors, animals } from 'unique-names-generator';

@Injectable()
export class ConverterService {
  private primitiveTypes: string[] = [
    'number',
    'string',
    'boolean',
    'undefined',
    'null',
  ];

  convertInterface(dto: ConverterRequestDto): any {
    const parsed = this.parseDtoString(dto.interface);

    const mainInterface = parsed[0];
    parsed.shift();

    const response = [];
    let maxLength = dto.count > 200 ? 200 : dto.count;
    for (let c = 0; c < dto.count; c++) {
      const fakeObj = this.generateData(mainInterface, parsed);
      if (fakeObj) {
        response.push(fakeObj);
      }
    }

    return response;
  }

  private generateData(mainInterface: string, interfacesArray: string[]): any {
    try {
      let interfaceObject = {};

      // let mainInterface = interfacesArray[0];
      mainInterface = this.removeInterfaceName(mainInterface);
      mainInterface = this.removeFirstAndLastBraces(mainInterface);
      let splitted = this.splitInterfacePropertyes(mainInterface);

      splitted.forEach((el) => {

        let [prop, type] = el.split(':').map((e) => e.trim());

        if (type === 'undefined' || type === 'null') {
          interfaceObject[prop] = type;
        } else if (this.primitiveTypes.includes(type)) {

          switch (type) {
            case 'string':
              if(this.isPropLastName(prop)) {
                interfaceObject[prop] = FIRST_NAMES[this.getRandomIndex(0, FIRST_NAMES.length - 1)]
              } else if(this.isPropUserName(prop)) {
                interfaceObject[prop] =  uniqueNamesGenerator({
                  dictionaries: [adjectives, colors],
                  separator: '-',
                  length: 2,
                })
                console.log(interfaceObject[prop])
              } else if(this.isPropFirstName(prop)) {
                interfaceObject[prop] = LAST_NAMES[this.getRandomIndex(0, LAST_NAMES.length - 1)]
              }  else if(prop.toLowerCase().includes('email')) {
                interfaceObject[prop] = 'example@domain.com';
              } else {
                interfaceObject[prop] = 'Lorem Ipsum';
              }
              break;
            case 'number':
              interfaceObject[prop] = Math.round(Math.random() * 10);
              break;
            case 'boolean':
              interfaceObject[prop] = !!Math.round(Math.random());
              break;
            default:
              interfaceObject[prop] = undefined;
          }

        } else {

          let intertaceExists = interfacesArray.filter((el) => {
            let i = el.indexOf('{');
            return el.slice(0, i).trim() === type;
          });

          if (intertaceExists.length) {
            interfaceObject[prop] = this.generateData(
              intertaceExists[0],
              interfacesArray,
            );
          }

        }
      });

      return interfaceObject;
    } catch (error) {
      console.log(error)
      return null;
    }
  }

  private parseDtoString(str: string): string[] {
    try {
      let stringsArr = str.split('interface');
      stringsArr = stringsArr
        .map((i) => i.trim())
        .map((i) => i.replace(/\n|\s/g, ''))
        .filter((i) => !!i);

      let interfacesCount = stringsArr.length;
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
    let countOpeningBraces = (str.match(/{/g) || []).length;
    let countClosingBraces = (str.match(/}/g) || []).length;
    return (
      countOpeningBraces > 0 &&
      countClosingBraces > 0 &&
      countOpeningBraces === countClosingBraces
    );
  }

  private removeInterfaceName(intString: string): string {
    let indexOfCurlyBraces = intString.indexOf('{');

    if (!indexOfCurlyBraces) return undefined;

    return intString.slice(indexOfCurlyBraces);
  }

  private removeFirstAndLastBraces(str: string): string {
    str = str.substring(1);
    str = str.substring(0, str.length - 1);
    return str;
  }

  private splitInterfacePropertyes(str: string): string[] {
    //split it with comma or semicolon depending on what user has used in interface
    return str
      .split(',')
      .map((e) => e.split(';'))
      .flat();
  }

  private isPropLastName(prop: string): boolean {
    return prop.toLowerCase().includes('name') && (prop.toLowerCase().includes('sur') || prop.toLowerCase().includes('last'));
  }

  private isPropUserName(prop: string): boolean {
    return prop.toLowerCase().includes('name') && (prop.toLowerCase().includes('user') || prop.toLowerCase().includes('nick'));
  }

  private isPropFirstName(prop: string): boolean {
    return prop.toLowerCase().includes('name');
  }

  private getRandomIndex(min = 0, max): number {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }

}
