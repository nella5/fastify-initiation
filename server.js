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
fastify.get('/me', function () {
	return {
		prenom: 'Rose',
		nom: 'Beko',
		job: 'CPWD',
	}
})
start()