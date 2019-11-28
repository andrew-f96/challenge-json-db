const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

const dummyData1 = { score: 98 }
const dummyData2 = { score: 97 }

tape('health', async function (t) {
  const url = `${endpoint}/health`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'should have successful healthcheck')
    t.end()
  })
})

tape('PUT student data test', async function (t) {
  const url = `${endpoint}/rn1abu8/courses/calculus/quizzes`

  t.plan(2)

  // For making sure json file is generated successfully.. 
  jsonist.put(url, dummyData1, (err, body) => {
    if (err) t.error(err)
    const expected = {
      'courses': {
        'calculus': {
          'quizzes': {
            'score': 98
          }
        }
      }
    }
    t.deepEqual(body, expected, 'should be passed successfully')
  })

  // For making sure the content of json file is updated correctly..
  jsonist.put(url, dummyData2, (err, body) => {
    if (err) t.error(err)
    const expected = {
      'courses': {
        'calculus': {
          'quizzes': {
            'score': 97
          }
        }
      }
    }
    t.deepEqual(body, expected, 'should be passed with new property')
  })
})

tape('GET student data test', async function (t) {
  t.plan(6)

  // For making sure it's failed if json file not found..
  let url = `${endpoint}/rn1abu9/courses/calculus/quizzes`
  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 404, 'shouldn\'t be passed for file not found')
    t.equal(body.error, 'File Not Found')
  })

  // For making sure it's failed if property doesn't exist in student..
  url = `${endpoint}/rn1abu8/courses/calculus/quizzes/extra123`
  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    const expected = 'Property Not Found'
    t.equal(res.statusCode, 404)
    t.equal(body.error, expected, 'should be failed for property not found')
  })

  // For making sure it's getting data successfully..
  url = `${endpoint}/rn1abu8/courses/calculus/quizzes`
  jsonist.get(url, (err, body, res) => {
    if (err) t.error(err)
    t.equal(res.statusCode, 200)
    t.equal(body.score, 97, 'should be passed successfully')
  })
})

tape('DELETE student data test', async function (t) {
  t.plan(7)

  // For making sure it's failed if json file not found..
  let url = `${endpoint}/rn1abu9/courses/calculus/quizzes`
  jsonist.delete(url, (err, body, res) => {
    if (err) t.error(err)
    const expected = 'File Not Found'
    t.equal(res.statusCode, 404)
    t.equal(body.error, expected, 'shouldn\'t be passed for file not found')
  })

  // For making sure it's failed if property doesn't exist in student..
  url = `${endpoint}/rn1abu8/courses/calculus/extra123`
  jsonist.delete(url, (err, body, res) => {
    if (err) t.error(err)
    const expected = 'Property Not Found'
    t.equal(res.statusCode, 404)
    t.equal(body.error, expected, 'should be failed for property not found')
  })

  // For making sure nested property is removed properly..
  url = `${endpoint}/rn1abu8/courses/calculus/quizzes`
  jsonist.delete(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'should be passed successfully')
  })
  url = `${endpoint}/rn1abu8/courses/calculus/quizzes`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.equal(body.error, 'Property Not Found')
  })
  url = `${endpoint}/rn1abu8/`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    const expected = {
      'courses': {
        'calculus': {}
      }
    }
    t.deepEqual(body, expected, 'should be passed successfully')
  })
})

tape('cleanup', function (t) {
  server.close()
  t.end()
})
