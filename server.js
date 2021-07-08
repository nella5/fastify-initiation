// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true }) // https://www.fastify.io/docs/latest/Getting-Started/
const { ObjectId } = require('mongodb') // https://docs.mongodb.com/drivers/node/current/fundamentals/
const argon2 = require('argon2') // https://www.npmjs.com/package/argon2
const createError = require('http-errors') // https://www.npmjs.com/package/http-errors

fastify.register(require('fastify-jwt'), {
  secret: 'monsupersecretamoiestungangster'
})

fastify.register(require('fastify-cors'), {
	origin: "*"
})


// Connexion à la BDD
fastify.register(require('./connector'))

// Importation des routes /heroes
fastify.register(require('./src/routes/heroes'))

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

fastify.get('/me', function () {
	return {
		prenom: 'Fabio',
		nom: 'Ginja Domingues',
		job: 'developpeur',
	}
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
	try {
		const collection = fastify.mongo.db.collection('users')
		const { email, password, role } = request.body
		
		// On récupère l'adresse email dans la request, puis on va chercher dans la bdd si cette derniere existe
		// Si elle existe, on genere une erreur indiquant que l'email existe deja
		// Si non, on ajoute l'utilisateur à notre bdd

		const userExist = await collection.findOne({ email })

		if (userExist) {
			// ⛔️ STOP
			return createError(409, "Cet email est déjà pris")
			// return createError.Conflict(err.message)
		}

		if (password.length < 3) {
			// throw new Error("Mot de passe trop court - au moins 3 caractères")
			return createError.NotAcceptable('Mot de passe trop court - au moins 3 caractères')
		}

		// const password = request.body.password
		const hash = await argon2.hash(password)
		const newUser = {
			email: request.body.email,
			password: hash,
			role: request.body.role
		}
		const result = await collection.insertOne(newUser)
		// return result.ops[0]
		reply.code(201).send(result.ops[0])
	} catch (err) {
		console.error(err)
		// reply.code(409).send({
		// 	statusCode: 409,
		// 	error: true,
		// 	message: err.message
		// })
		return createError(500, err.message)
	}
})

fastify.get('/users', async (request, reply) => {
	const collection = fastify.mongo.db.collection('users')
	const result = await collection.find().toArray()
	return result
})

fastify.post('/login', async (request, reply) => {
	// Je récupère l'email et le password dans request,
	// Je cherche si un utiliseur possede cet email,
	// S'il existe, on vérifie que les password correspondent
	// Sinon, on génère une erreur

	const { email, password } = request.body
	console.log({email, password})
	const collection = fastify.mongo.db.collection('users')

	const userExists = await collection.findOne({ email })

	if (!userExists) {
		return createError(400, "Email et/ou mot de passe incorrect")
	}

	const match = await argon2.verify(userExists.password, password)

	if (!match) {
		return createError(400, "Email et/ou mot de passe incorrect")
	}

	// Je sais que l'email et le mot de passe sont corrects, j'envoi un token au client (permettant d'ainsi l'authentifier)
	const token = fastify.jwt.sign({ id: userExists._id, role: userExists.role })

	return { token }
})

fastify.get('/protected', async (request, reply) => {
	// Si l'utilisateur ne m'envoie pas de token, je dois lui retourner une erreur
	// Sinon, je lui retourne un objet contenant la propriété message avec Bienvenue comme valeur
	await request.jwtVerify()
	return { message: "Bienvenue" }
})

fastify.get('/users/:id', async (request, reply) => {
	const collection = fastify.mongo.db.collection('users')
	// const id = request.params.id
	const { id } = request.params
	const result = await collection.findOne({_id: new ObjectId(id)})
	// reply.code(200).send(result)
	return result
})

fastify.patch('/users/:id', async (request, reply) => {
	const collection = fastify.mongo.db.collection('users')
	const { id } = request.params
	const result = await collection.findOneAndUpdate(
		{ _id: new ObjectId(id) },
		{ $set: request.body },
		{ returnDocument: "after" }
	)
	reply.code(200).send(result)
	// return result
})

fastify.delete('/users/:id', async (request, reply) => {
	const collection = fastify.mongo.db.collection('users')
	const { id } = request.params
	const res = await collection.findOneAndDelete({_id: new ObjectId(id)})
	// return res
	reply.code(200).send(res)
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