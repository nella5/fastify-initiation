// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })
const { ObjectId } = require('mongodb')

// Connexion à la BDD
fastify.register(require('fastify-mongodb'), {
	forceClose: true,
	url: 'mongodb://localhost:27017/superheroes',
})

// METHOD API REST
// GET - READ
// POST - CREATE
// PATCH / PUT - UPDATE
// DELETE - DELETE

// Declare a route
fastify.get('/', (request, reply) => {
	// Ici on retourne un objet javascript qui va être converti en JSON (JavaScript Object Notation)
	return { hello: 'world' }
})

// Déclarer la route /heroes - Cette route retournera la liste des heros
// /heroes GET - Obtiens la liste des héros
fastify.get('/heroes', async () => {
	const collection = fastify.mongo.db.collection('heroes')
	const result = await collection.find({}).toArray()
	return result
})

// /heroes/69 GET - Obtiens le héros ayant l'id 69
// /heroes/:heroId ... findOne()
fastify.get('/heroes/:heroesId', async (request, reply) => {
	// Documentation: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
	// const heroesId = request.params.heroesId
	const { heroesId } = request.params
	const collection = fastify.mongo.db.collection('heroes')
	const result = await collection.findOne({
		_id: new ObjectId(heroesId),
	})
	return result
})

// /heroes/bio/id
// Cette route devra retourner: nomDuHero connu sous le nom de vraiNom. Je suis née à lieuDeNaissance. J'ai XX en intelligence, et YY en vitesse.
fastify.get('/heroes/bio/:heroesId', async (request, reply) => {
	const collection = fastify.mongo.db.collection('heroes')
	const { heroesId } = request.params
	const result = await collection.findOne({
		_id: new ObjectId(heroesId),
	})

	// Version ES6
	const {
		name,
		biography,
		powerstats: { intelligence, speed },
	} = result

	// Template literals: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
	return `${name} connu sous le nom de ${biography['full-name']}. Je suis née à ${biography['place-of-birth']}. J'ai ${intelligence} en intelligence, et ${speed} en vitesse.`

	// Version ES5 (vieux JS)
	// const name = result.name
	// const fullName = result.biography["full-name"]
	// const placeOfBirth = result.biography["full-name"]
	// const intelligence = result.powerstats.intelligence
	// const speed = result.powerstats.speed

	// return name + " connu sous le nom de " + fullName + ". Je suis née à " + placeOfBirth + ". J'ai " + intelligence + " en intelligence, et + " + speed + " en vitesse."
})

// /heroes POST - Ajoute un nouvel héro
fastify.post('/heroes', async (request, reply) => {
	const collection = fastify.mongo.db.collection('heroes')
	const result = await collection.insertOne(request.body)
	return result.ops[0]
	// reply.send(null)
})

fastify.delete('/heroes/:heroesId', async (request, reply) => {
	const collection = fastify.mongo.db.collection('heroes')
	const { heroesId } = request.params
	const result = await collection.findOneAndDelete({
		_id: new ObjectId(heroesId)
	})
	return result
})

fastify.patch('/heroes/:id', async (request, reply) => {
	const collection = fastify.mongo.db.collection('heroes')
	const { id } = request.params
	const result = await collection.findOneAndUpdate(
		{ _id: new ObjectId(id) },
		{ $set: request.body },
		{ returnDocument: 'after' },
	)
	return result
})



// Je souhaite:
// Une route qui me permette de créer un nouvel utilisateur (user) dans une collection users
// 		- email
// 		- password
// 		- role (user/admin)
// Une route qui me permette de récupérer tout les utilisateurs
// Une route qui me permette de récupérer un utilisateur par son id
// Une route qui me permette de mettre à jour un utilisateur par son id
// Une route qui me permette de supprimer un utilisateur par son id

fastify.post('/users', async (request, reply) => {
	const collection = fastify.mongo.db.collection('users')
	const result = await collection.insertOne(request.body)
	return result.ops[0]
})

fastify.get('/users', async (request, reply) => {
	const collection = fastify.mongo.db.collection('users')
	const result = await collection.find().toArray()
	return result
})


fastify.post('/me', function () {
	return {
		prenom: 'Fabio',
		nom: 'Ginja Domingues',
		job: 'developpeur',
	}
})


// Run the server!
const start = async () => {
	try {
		console.log('Serveur lancé: http://localhost:4000')
		await fastify.listen(4000)
	} catch (err) {
		fastify.log.error(err)
		process.exit(1)
	}
}
start()