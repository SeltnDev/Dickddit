const express = require("express")
const app = express()
const fetch = require("node-fetch")
const { marked } = require('marked')

//Database settings
const database = require("wio.db")
const db = new database.JsonDatabase({ databasePath: "./config.json" })

const bp = require("body-parser")

app.use(bp.urlencoded({ extended: false }))

app.use(bp.json())

app.use(express.static(process.cwd() + "/src/public"))

//Home r/Popular
app.get("/", async (req, res) => {
    let limit = 8
    let after = req.query.after || ""
    let response = await fetch(`https://reddit.com/r/popular/.json?limit=${limit}&after=${after}`).then((res) => res.json())     
    res.render(process.cwd() + "/src/ejs/index.ejs", { response, config: db.fetch("settings"), after, })
})

//Home r/Popular new filter
app.get("/new", async (req, res) => {
    let limit = 8
    let after = req.query.after || ""
    let response = await fetch(`https://reddit.com/r/popular/new/.json?limit=${limit}&after=${after}`).then((res) => res.json())      
    res.render(process.cwd() + "/src/ejs/index.ejs", { response, config: db.fetch("settings"), after })
})

//Home r/Popular top filter
app.get("/top", async (req, res) => {
    let limit = 8
    let after = req.query.after || ""
    let response = await fetch(`https://reddit.com/r/popular/top/.json?limit=${limit}&after=${after}`).then((res) => res.json())      
    res.render(process.cwd() + "/src/ejs/index.ejs", { response, config: db.fetch("settings"), after })
})

//Search posts on reddit
app.get("/search", async (req, res) => {
    if(req.query.q){
        if(req.query.q.startsWith("r/") || req.query.q.startsWith("R/")){
            res.redirect(req.query.q)
        }else{
            let response = await fetch(`https://reddit.com/search/.json?&q=${req.query.q}`).then((res) => res.json())
            if(response.data.children.length > 0){
                res.render(process.cwd() + "/src/ejs/search.ejs", { q: req.query.q, response, config: db.fetch("settings") })
            }else{
                res.render(process.cwd() + "/src/ejs/404.ejs", { config: db.fetch("settings") })
            }
        }
    }else{
        res.redirect("/")
    }
})

//Subreddit
app.get("/r/:sub", async (req, res) => {
    if (req.params.sub) {
      let limit = 8
      let after = req.query.after || ""
      let response = await fetch(`https://reddit.com/r/${req.params.sub}/.json?limit=${limit}&after=${after}`).then((res) => res.json())
      let about = await fetch(`https://reddit.com/r/${req.params.sub}/about/.json`).then((res) => res.json())
      let rules = await fetch(`https://reddit.com/r/${req.params.sub}/about/rules/.json`).then((res) => res.json())
      if (response.data) {
        res.render(process.cwd() + "/src/ejs/subreddit.ejs", { response, config: db.fetch("settings"), after, sub: req.params.sub, about, rules, marked })
      } else {
        res.render(process.cwd() + "/src/ejs/404.ejs", { config: db.fetch("settings") })
      }
    } else {
      res.redirect("/")
    }
})

//Subreddit new filter
app.get("/r/:sub/new", async (req, res) => {
    if (req.params.sub) {
      let limit = 8
      let after = req.query.after || ""
      let response = await fetch(`https://reddit.com/r/${req.params.sub}/new/.json?limit=${limit}&after=${after}`).then((res) => res.json())
      let about = await fetch(`https://reddit.com/r/${req.params.sub}/about/.json`).then((res) => res.json())
      let rules = await fetch(`https://reddit.com/r/${req.params.sub}/about/rules/.json`).then((res) => res.json())
      console.log(rules)
      if (response.data.children.length > 0) {
        res.render(process.cwd() + "/src/ejs/subreddit.ejs", { response, config: db.fetch("settings"), after, sub: req.params.sub, about, rules, marked })
      } else {
        res.render(process.cwd() + "/src/ejs/404.ejs", { config: db.fetch("settings") })
      }
    } else {
      res.redirect("/")
    }
})

//Subreddit top filter
app.get("/r/:sub/top", async (req, res) => {
    if (req.params.sub) {
      let limit = 8
      let after = req.query.after || ""
      let response = await fetch(`https://reddit.com/r/${req.params.sub}/top/.json?limit=${limit}&after=${after}`).then((res) => res.json())
      let about = await fetch(`https://reddit.com/r/${req.params.sub}/about/.json`).then((res) => res.json())
      let rules = await fetch(`https://reddit.com/r/${req.params.sub}/about/rules/.json`).then((res) => res.json())
      if (response.data.children.length > 0) {
        res.render(process.cwd() + "/src/ejs/subreddit.ejs", { response, config: db.fetch("settings"), after, sub: req.params.sub, about, rules, marked })
      } else {
        res.render(process.cwd() + "/src/ejs/404.ejs", { config: db.fetch("settings") })
      }
    } else {
      res.redirect("/")
    }
})

//Post
app.get("/r/:sub/comments/:id/:post", async (req, res) => {
    if(req.params.post){
        let response = await fetch(`https://reddit.com/r/${req.params.sub}/comments/${req.params.id}/${req.params.post}/.json`).then((res) => res.json())
        let about = await fetch(`https://reddit.com/r/${req.params.sub}/about/.json`).then((res) => res.json())
        let about_post = await fetch(`https://reddit.com/r/${req.params.sub}/comments/${req.params.id}/${req.params.post}/.json`).then((res) => res.json())
        let rules = await fetch(`https://reddit.com/r/${req.params.sub}/about/rules/.json`).then((res) => res.json())
        response[0].data.children.forEach(element => {
          console.log(element.data.all_awardings)
        });
        if(response[1].data.children.length > 0){
            res.render(process.cwd() + "/src/ejs/post.ejs", { response, config: db.fetch("settings"), about, rules, about_post, marked })
        }else{
            res.render(process.cwd() + "/src/ejs/404.ejs", { config: db.fetch("settings") })
        }
    }else{
        res.redirect("/")
    }
})

//Settings
app.get("/settings", (req, res) => {
  res.render(process.cwd() + "/src/ejs/settings.ejs", { config: db.fetch("settings") })
})

//Change settings
app.post("/settings", (req, res) => {
  if(req.body.change_title && req.body.password){
    if(req.body.password === db.fetch("settings").password){
      if(!req.body.change_password && !req.body.change_description){
        db.set("settings", { 
          title: req.body.change_title,
          description: "",
          password: db.fetch("settings").password
         })
        res.redirect("/settings")
      }else{    
        db.set("settings", { 
          title: req.body.change_title,
          description: req.body.change_description,
          password: req.body.change_password
        })
        res.redirect("/settings")
      }
    }else{
      res.redirect("/settings?error")
    }
  }else{
    res.redirect("/settings?error")
  }
})

app.listen(3000, () => {
    console.log("Server Active")
})
