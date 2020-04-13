require('dotenv').config();
// Define controllers
const express          = require ("express"),
      ejs              = require ("ejs"),
      bodyParser       = require ("body-parser"),
      mongoose         = require("mongoose"),
      methodOverride   = require('method-override'),
      Float            = require('mongoose-float').loadType(mongoose,24);
      
//Define applications / Usage
const app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride('_method'));

//DataBase

mongoose.connect("mongodb+srv://APPesha:"+process.env.DB_PASS+"@appesha-rptjg.mongodb.net/tagupchallenge?retryWrites=true&w=majority",{useNewUrlParser: true,useFindAndModify:false,useCreateIndex: true, useUnifiedTopology:true }).then(()=>{
    console.log("Connected to DB")
}).catch((err)=>{
    console.log("Error, Unable to connect to DB")
})


//Schema //Model

const tagupSchema = new mongoose.Schema({
    timeStamp:{
      type: Number,
      required:true
    },
    titleName:{
        type: String,
        required:true
    },
    titleOrigin:{
        type: String,
        required:true
    },
    titleDestination:{
        type: String,
        required:true
    },
  title:{
    type: String,
    required:true
  },
  roundTrip:{
      type: Boolean,
      required:true
  },
  finalFuel:{
    type:Float,
    required:true
  },
  finalFuelPerKg:{
      type:Float,
      required:true
  },
  createdAt:Number,
  updatedAt:Number,  
 },{
    timestamps: { currentTime: () => (Date.now())}
})

tagup = mongoose.model("tagup",tagupSchema)

//Clear Up all the db
/* tagup.deleteMany({},(err)=>{
    if(!err){
        console.log("All test DB Deleted")
    }
})
 */
//Routes

app.get("/", (req,res)=>{
    res.render("challenge/index")
})
app.get("/create", (req,res)=>{
    res.render("challenge/create")
})

let cargoload = 56657
let numofcust = 275
let numcrew = 16
let avgweight = 75
let totalweight = (cargoload + (numcrew + numofcust)*avgweight)

app.post("/create", (req,res)=>{

    let title = req.body.titlename + " / " + req.body.titleorigin + " to " + req.body.titledestination;
    let finalFuelPerKg = ""
        if(req.body.roundtrip === "1"){
            finalFuelPerKg =  (req.body.finalfuel / totalweight)/2;
        }else{
            finalFuelPerKg = (req.body.finalfuel / totalweight);
        }
    tagup.create({
        timeStamp: req.body.timestamp,
        titleName:req.body.titlename,
        titleOrigin:req.body.titleorigin,
        titleDestination:req.body.titledestination,
        title: title,
        roundTrip: req.body.roundtrip,
        finalFuel:req.body.finalfuel,
        finalFuelPerKg:finalFuelPerKg
    } ,(err,newList)=>{
        if(!err){
            res.redirect("/listall")
        }else{ 
            console.log(err)
        }
    })
 
})
app.get("/listall", (req,res)=>{
    tagup.find({},("timeStamp title roundTrip finalFuelPerKg"), (err,allLists)=>{
        if(!err){
            res.render("challenge/listall",{allLists:allLists})
        }else{
            console.log(err)
        }
    })
})

app.get("/show/:id", (req,res)=>{
    tagup.findById(req.params.id,("timeStamp title roundTrip finalFuelPerKg"),(err,selectedId)=>{
      if(!err){
        res.render("challenge/show",{selectedId:selectedId})
      }
    })
})

app.get("/update/:id", (req,res)=>{
    tagup.findById(req.params.id, (err,updateId)=>{
        if(!err){
            res.render("challenge/update",{updateId:updateId})
        }
    })
 
})
app.put("/update/:id",(req,res)=>{
    let title = req.body.titlename + " / " + req.body.titleorigin + " to " + req.body.titledestination;
    let finalFuelPerKg = ""
        if(req.body.roundtrip === "1"){
            finalFuelPerKg =  (req.body.finalfuel / totalweight)/2;
        }else{
            finalFuelPerKg = (req.body.finalfuel / totalweight);
        }
    tagup.findByIdAndUpdate(req.params.id, 
        {
            timeStamp: req.body.timestamp,
            titleName:req.body.titlename,
            titleOrigin:req.body.titleorigin,
            titleDestination:req.body.titledestination,
            title: title,
            roundTrip: req.body.roundtrip,
            finalFuel:req.body.finalfuel,
            finalFuelPerKg:finalFuelPerKg
        }, (err,updatedId)=>{
        if(!err){
            res.redirect("/show/"+req.params.id)
        }else{
            console.log(err)
        }
    })
})

app.delete("/delete/:id", (req,res)=>{
    tagup.findByIdAndRemove(req.params.id,(err)=>{
        if(!err){
            res.redirect("/listall")
        }
    })
})

//Server
app.listen(process.env.PORT || 3000,()=>{
    console.log("Connected to Local Server")
})