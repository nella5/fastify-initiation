// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })

//Connexion à la bdd
fastify.register(require('fastify-mongodb'), {
 
  // the default value is false
  forceClose: true,
  
  url: 'mongodb://localhost:27017/superheroes'
})
//METHOD API REST
//GET -READ
//POST-CREATE
//PATCH/PUT - UPDATE
//DELETE -DELETE
// Declare a route
fastify.get('/', (request, reply) => {
  return { hello: 'world' }
})

//Déclarer la route/heroes - Cette route retournera 
//la liste des avengers
const avengers=["Iron man", "Captain america", "Spiderman"]
 // heroes GET - obtiens la liste des héros
fastify.get('/heroes',()=>{
return{
	avengers
}
 })
 

// /heroes POST - Ajoute un nouvel héro
fastify.post('/heroes', (request, reply) => {
	console.log(request.body)
  const collection =fastify.mongo.db.collection("heroes")
  console.log(collection)
  collection.insertOne({
name:request.body.name,
powerstats:request.body.powerstats,

  })
	return request.body
})

fastify.get('/me',function(){
  console.log("Route/heroes en POST atteinte")
return{
	prenom:"Ornella",
nom:"lisongo",
	job:"cpw",
  //toto
}

})
// Run the server!
const start = async () => {
  try {
    await fastify.listen(4000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()