// Aqui criaremos um servidor HTTP.

const express = require('express') 
const cors = require('cors')
const { uuid, isUuid } = require('uuidv4') // Essa biblioteca vai gerar um id unico e universal.

const app = express()
app.use(cors()) // Dessa forma o back-end está dizendo que permite que qualquer front-end vai ter acesso ao nosso back-end.

// Por padrão o express não interpreta o que enviamos para ele em JSON, para dizermos ao express que queremos receber informações no formato de JSON usamos o express.json()  
app.use(express.json()) // O método use() é usado quando queremos adicionar alguma função que todas as rotas vão ter que passar por essa função.

// ------------------------------- Aplicação funcional --------------------------

const projects = []

function logRequests1(request, response, next){ 
    const { method, url } = request

    const logLabel = `[${method.toUpperCase()} ${url}]`

    console.log(logLabel) // Mostra quais métodos e rotas da aplicação estão sendo chamados.

    return next() // Chama o próximo middleware.
}

function logRequests(request, response, next){
    const { method, url } = request

    const logLabel = `[${method.toUpperCase()} ${url}]`

    console.time(logLabel) 
    console.log('1')

    next() // Chama o próximo middleware.
    
    console.log('2') 
    console.timeEnd(logLabel)
}

function validateProjectId(request, response, next){
    const { id } = request.params

    if(!isUuid(id)){
        return response.status(400).json({ error: 'Invalid project ID.'})
    }

    return next()
}

app.use(logRequests) // Aplica esse middleware para todas as rotas que estiverem abaixo da linha de código dele.

app.use('/projects1/:id', validateProjectId) // Aqui o middlware só será aplicado nas rotas que tiverem o padrão '/projects/:id'. Podemos anexar quantos middlewares quiser, sendo separados por virgula.

app.get('/projects1', logRequests1, (request, response) => {
    console.log('3')

    // Todo retorno da rota precisa sempre utilizar o parametro 'resp'.
    
    // const query = request.query // Query params
    // console.log(query)
    
    // Usando Desestruturação.
    const { title } = request.query // Query Params.

    const results = title ? 
        projects.filter(project => project.title.includes(title)) : projects
        // O método includes() determina se uma string pode ser encontrada dentro de outra string, retornando true ou false, conforme apropriado.
        
    return response.json(results)  // No json sempre deve ser retornado um Array ou um Objeto.
    
})

app.post('/projects1', (request, response) => {
    // const body = request.body
    //  console.log(body)

    // Usando a Desestruturação.
    const { title, owner } = request.body // Request Body
    
    const project = { id: uuid(), title, owner }
    
    projects.push(project)
    
    return response.json(project)
})

// O Patch vai funcionar da mesma forma do Put.
app.put('/projects1/:id', validateProjectId, (request, response) => { // Os ":" significa que vamos receber um parametro de rota(Route params) para indicar qual projeto queremos atualizar.
    
    // const params = request.params // Route Params.
    // console.log(params) // Vai retornar um objeto: { id: algumNumero }. O nome id ocorre pois foi o nome que demos para o Route Param na rota do put.

    // Usando Desestruturação.
    const { id } = request.params // Route Params.
    const { title, owner } = request.body // Request Body

    // const project = projects.find(project => project.id === id) // O método find() retorna o valor do primeiro elemento do array que satisfizer a função de teste provida. Caso contrario, undefined é retornado.

    const projectIndex = projects.findIndex(project => project.id === id) // O método findIndex() retorna o índice no array do primeiro elemento que satisfizer a função de teste provida. Caso contrário, retorna -1, indicando que nenhum elemento passou no teste.

    if(projectIndex < 0){
        return response.status(400).json({ error: 'Project not found.'})
    }

    const project = {
        id,
        title,
        owner
    }

    projects[projectIndex] = project

    return response.json(project)
})

app.delete('/projects1/:id', validateProjectId, (request, response) => {// Os ":" significa que vamos receber um parametro de rota(Route params) para indicar qual projeto queremos deletar.

    const { id } = request.params

    const projectIndex = projects.findIndex(project => project.id === id)

    if(projectIndex < 0){
        return response.status(400).json({ error: 'Project not found.' })
    }

    projects.splice(projectIndex, 1) // Remove 1 elemento a partir do índice projectIndex.
    // Outro exemplo usando splice seria: 
    // remove 0 elementos a partir do índice 2, e insere "drum"
    // var removed = myFish.splice(2, 0, "drum");

    return response.status(204).send() // Quando é uma responsa que não tem conteúdo é recomendado que enviemos com o código 204.
})
        
app.listen((3333), () => { // É a função que escuta os eventos na porta específicada.
    console.log('back-end started!') // Essa mensagem será colocada no terminal toda vez que subirmos o servidor.
}) 