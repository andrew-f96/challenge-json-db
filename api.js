const fs = require('fs')
const { JsonDB } = require('node-json-db')
const { Config } = require('node-json-db/dist/lib/JsonDBConfig')

module.exports = {
  getHealth,
  putStudentData,
  getStudentData,
  deleteStudentData
}

function getHealth (req, res, next) {
  res.json({ success: true })
}

/**
 * putStudentData is a method called from `PUT` api.
 * It's defined simply to create/update json file based on request data.
 */
function putStudentData (req, res, next) {
  const { body } = req
  const { studentId, propertyName } = req.params
  const jsonDB = new JsonDB(new Config(`./data/${studentId}`, true, true, '/'))

  jsonDB.push(`/${propertyName}`, body)
  res.json(jsonDB.data)
}

/**
 * getStudentData is a method called from `GET` api.
 * It's defined simply to return json data retrieved with property in request.
 */
function getStudentData (req, res, next) {
  const { studentId, propertyName } = req.params
  const filePath = `./data/${studentId}.json`

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File Not Found' })
  }

  const jsonDB = new JsonDB(new Config(filePath, true, true, '/'))

  try {
    const result = jsonDB.getData(`/${propertyName}`)
    res.json(result)
  } catch (err) {
    res.status(404).json({ error: 'Property Not Found' })
  }
}

/**
 * deleteStudentData is a method called from `DELETE` api.
 * It's defined simply to delete specific json nodes based on request data.
 */
function deleteStudentData (req, res, next) {
  const { studentId, propertyName } = req.params
  const filePath = `./data/${studentId}.json`

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File Not Found' })
  }

  const jsonDB = new JsonDB(new Config(filePath, true, true, '/'))

  if (!jsonDB.exists(`/${propertyName}`)) {
    return res.status(404).json({ error: 'Property Not Found' })
  }

  jsonDB.delete(`/${propertyName}`)
  res.json({ success: true })
}
