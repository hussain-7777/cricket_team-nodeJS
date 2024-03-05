const express = require('express')
const app = express()
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
const dbPath = path.join(__dirname, 'cricketTeam.db')
app.use(express.json())

let db = null
const initializeDBAndServer = async (request, response) => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

//GET players API
const DBObjToRespObj = player => {
  return {
    playerId: player.player_id,
    playerName: player.player_name,
    jerseyNumber: player.jersey_number,
    role: player.role,
  }
}
app.get('/players/', async (request, response) => {
  const getPlayersQuery = `select * from cricket_team 
  order by player_id;`
  const playersArray = await db.all(getPlayersQuery)
  response.send(playersArray.map(player => DBObjToRespObj(player)))
})

//Add Player API
app.post(`/players/`, async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const addPlayerQuery = `insert into cricket_team 
  (player_name, jersey_number, role)
  values('${playerName}', '${jerseyNumber}', '${role}');`
  const player = await db.run(addPlayerQuery)
  response.send('Player Added to Team')
})
//Get Player API
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `select * from cricket_team
  where player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(DBObjToRespObj(player))
})
//Update Player API
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const {playerName, jerseyNumber, role} = request.body
  const updatePlayerQuery = `update cricket_team set
  player_name = '${playerName}',
  jersey_number = '${jerseyNumber}',
  role = '${role}' 
  where player_id = ${playerId};`
  const updatedPlayer = await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})
//Delete Player API
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `delete from cricket_team
  where player_id = ${playerId};`
  const deletedPlayer = await db.run(deletePlayerQuery)
  response.send('Player Removed')
})

module.exports = app
