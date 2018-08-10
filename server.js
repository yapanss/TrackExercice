require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()
var port = process.env.PORT || 3000

app.use(express.static(__dirname + '/public'))
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

// Connection to the server

 mongoose.connect((process.env.MONGO_URI), {
 	useNewUrlParser: true
 }).then(() => {
     console.log('Database connection successful')
     console.log(`Current directory: ${process.cwd()}`);
 })
  .catch(err => {
     console.error('Database connection error')
 })

// Schemas and Models
const UserSchema = mongoose.Schema({
	username: {
		type: String,
		required: "The username is required"
	}
})

const ExerciseSchema = mongoose.Schema({
	userId: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	duration: {
		type: Number,
		required: true
	},
	date: Date
})

const User = mongoose.model('User', UserSchema)
const Exercise = mongoose.model('Exercise', ExerciseSchema)

// Root route

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/views/index.html')
})

app.get('/api/exercise/log', (req, res) => {
	var query
	console.log('req.query : ', req.query)
	// const date1 = new Date(req.query.from).toISOString()
	// const date2 = new Date(req.query.to).toISOString()
	// console.log(`date1 : ${date1} \n date2: ${date2}` )
	if(req.query.from && req.query.to) {
		const date1 = new Date(req.query.from).toISOString()
		const date2 = new Date(req.query.to).toISOString()
		query = {userId: req.query.userId, date: {"$gte": date1, "$lte": date2}}
	} else {
		query = {userId: req.query.userId}
	}
	
	Exercise.find(query).limit(Number(req.query.limit))
	.then((exercises) => {
		res.json(exercises)
	})
	.catch((err) => {
		console.log(err)
	})
})

app.post('/api/exercise/new_user', (req, res) => {
	const user = new User(req.body)
	user.save()
	.then(() => {
		res.json({message: "User Saved", Username: req.body.username})
	})
	.catch((err) => {
		console.log(err)
	})
})

app.post('/api/exercise/add', (req, res) => {
	const exercise = new Exercise(req.body)
	exercise.save()
	.then(() => {
		res.json({message: "Exercise Saved"})
	})
	.catch((err) => {
		console.log(err)
	})
})


app.listen(port, () => {
	console.log("server running on Port ", port)
})
