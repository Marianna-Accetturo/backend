const mongoose =require ("mongoose");
const bcrypt= require("bcrypt");

const modelAreaPersonaleSchema = new mongoose.Schema({
  email:{
    type:String,
    required:[true, "email in Required"],
    unique:true,
},
password:{
    type:String,
    required:[true, "password in Required"],
    //unique:true,
},

booked_events: [ {
  event: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Eventi' 
  },
  tickets: { 
    type: Number, 
    required: true 
  }
  }]
});


modelAreaPersonaleSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

modelAreaPersonaleSchema.statics.login=async function(email, password){
  const user=await this.findOne({email});
  if(user){ 
      const auth=await bcrypt.compare(password, user.password);
      if (auth ){
          return user;
      }
      throw Error("password non corretta");
  }
  throw Error("email non corretta");
};

module.exports = mongoose.model("User", modelAreaPersonaleSchema);