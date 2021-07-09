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