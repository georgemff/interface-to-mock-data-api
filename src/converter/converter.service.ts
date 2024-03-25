import { Injectable } from '@nestjs/common';
import { ConverterRequestDto } from './dto';
import { parse } from 'path';

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
    // this.generateData(parsed);
    const mainInterface = parsed[0];
    parsed.shift()

    return this.generateData(mainInterface, parsed);
  }

  private generateData(mainInterface: string, interfacesArray: string[]): any {
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
            interfaceObject[prop] = 'Random String';
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
        let intertaceExists = interfacesArray.filter(el => {
          let i = el.indexOf("{");
          return el.slice(0,i).trim() === type
        });
        
        if(intertaceExists.length) {
          interfaceObject[prop] = this.generateData(intertaceExists[0], interfacesArray);
        }
      }
    });
    

    return interfaceObject;
  }

  private parseDtoString(str: string): string[] {
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
}
