import { parseXml } from './parse-xml'

test('it should parse some xml successfully', async function () {
  const xml = '<a><b>c</b></a>'
  const data = await parseXml(xml)

  expect(data).toMatchSnapshot()
})

test('it should throw an exception with invalid xml', async function () {
  const xml = '<a><b>c'

  await expect(parseXml(xml)).rejects.toMatchSnapshot()
})
