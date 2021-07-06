// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true })

// Declare a route
fastify.get('/', (request, reply) => {
  return { hello: 'world' }
})

const avengers=["Iron man", "Captain america", "Spiderman"]
 fastify.get('/heroes',()=>{
return{
	avengers
}
 })
 

fastify.get('/me',function(){
return{
	prenom:"Ornella",
	nom:"lisongo",
	job:"developpeur",
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