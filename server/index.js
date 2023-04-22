const express = require('express')
const mongoose =require('mongoose')
const app = express()
const cors  = require('cors')

app.use(express.json())
app.use(cors())

// Schemas

const AddsSchema = new mongoose.Schema({
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyNames' },
    primaryText: String,
    headline: String,
    description: String,
    CTA: String,
    imageUrl: String,
  });

AddsSchema.index({ "$**": "text" })

const CompanySchema = new mongoose.Schema({
    companyName : String,
    company_url : String
})

CompanySchema.index({ "$**": "text" })


// Database Connection

const ConnectDb =  async() =>{
    try{
        await mongoose.connect("mongodb+srv://vishwanathyuva143:V0vgSfbDggzM5mtQ@searchCluster.arbnyjf.mongodb.net/searchDb?retryWrites=true&w=majority",{
        useNewUrlParser:true , useUnifiedTopology:true
    })
    console.log('connected to mangoDb Successfully')
    }catch(err){
        console.log(err)
    }
    
    app.listen('4000',()=>{
        console.log('App is listening on port 4000')
    })
}

ConnectDb()

const Adds = mongoose.model('Adds', AddsSchema , "Adds");
const Company = mongoose.model('CompanyNames', CompanySchema , "CompanyNames");

// Backend Api

app.post('/', async(req,res)=>{
    const val = req.body.searchVal;
    console.log(val)
    // const allUsers = await Adds.aggregate([{$lookup : {from : 'CompanyNames' , localField : 'companyId' , foreignField :'_id'  , as : 'Company' }} ,
    //                             {$unwind : '$Company'},
    //                             {$match : {$or : [{"description" : new RegExp(val, "i")},{"headline" : new RegExp(val, "i")},{"primaryText" : new RegExp(val, "i")} , {"Company.companyName"  : new RegExp(val, "i")}]}}
    //                         ]);

    const allUsers = await Company.aggregate([
        {
          $lookup: {
            from: "Adds",
            localField: "_id",
            foreignField: "companyId",
            as: "Adds"
          }
        },
        {
            $unwind: {
              path: "$Adds",
              preserveNullAndEmptyArrays: true
            }
          },
        {
          $match: {
            $or: [
              { "Adds.description":new RegExp(val, "i")  },
              { "Adds.headline": new RegExp(val, "i") },
              { "Adds.primaryText": new RegExp(val, "i") },
              {"companyName"  : new RegExp(val, "i")}
            ]
          }
        },
        {
            $project: {
              description: "$Adds.description",
              headline: "$Adds.headline",
              primaryText: "$Adds.primaryText",
              CTA : "$Adds.CTA",
              companyName:1,
              companyUrl: 1,
            }
          }
      ]); 
    res.send(allUsers)
})
