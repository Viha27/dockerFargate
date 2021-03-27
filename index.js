const { request, response, urlencoded } = require('express')
const fs = require('fs')
const express = require('express')
const app = express()

app.use(express.json())
app.use(urlencoded({extended:true}))

app.get('/',(request, response) => {
    return response.send('Hello, world!')
})

app.post('/todo',(request,response)=>{
    if(!request.body.name){
        return response.status(400).send('Somhing went wrong')
    }

    fs.readFile('./store/todos.json','utf-8',(err,data)=>{
        if(err){
            return response.status(500).send('Something went wrong')
        }
        let todos = JSON.parse(data)
        const maxId = Math.max.apply(Math,todos.map(t => {return t.id}))


        todos.push({
            id: maxId+1,
            complete:false,
            name: request.body.name
        })

        fs.writeFile('./store/todos.json',JSON.stringify(todos),()=>{
            return response.json({"status":"ok" })
        })

    })
})

app.get('/todos',(request,response)=>{
    const showPending = request.query.showPending

    fs.readFile('./store/todos.json','utf-8',(err,data)=>{
        if(err){
            return response.status(500).send('Sorry,something went wrong')
        }
        const todos = JSON.parse(data)
        
        if(showPending !== "1"){
            return response.json({todos:todos})
        }else{
            return response.json({todos:todos.filter(t=> {return t.complete === false})})
        }
    })
})

app.put('/todos/:id/complete',(request,response)=>{
    const id = request.params.id

    const findbyId = (todos,id) =>{
        for(let i = 0; i<todos.length; i++){
            if(todos[i].id === parseInt(id)){
                return i;
            }
        }
        return -1
    }

    fs.readFile('./store/todos.json','utf-8',(err,data)=>{
        if(err){
            return response.status(500).send('Something went wrong')
        }
        let todos = JSON.parse(data)
        const todosIndex = findbyId(todos,id)

        if(todosIndex === -1){
            return response.status(404).send('Sorry, not found')
        }

        todos[todosIndex].complete = true

        fs.writeFile('./store/todos.json',JSON.stringify(todos),()=>{
            return response.json({"status":"ok" })
        })

    })
})

app.listen(3000,()=>{
    console.log('Application running on http://localhost:3000')
})