import { Parser } from 'xml2js'

export function parseXml (xmlString : string) : Promise<any> {
  return new Promise((resolve, reject) => {
    const p = new Parser()
    p.parseString(xmlString, (err : Error, result : any) => {
      if (err) {
        return reject(err)
      }

      return resolve(result)
    })
  })
}
