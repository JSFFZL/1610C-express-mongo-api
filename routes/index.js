var express = require('express');
var router = express.Router();
var mymongo = require('mymongo1610');
var mongoClient = require('mongodb').MongoClient;


/* GET home page. */

//查询列表
router.get('/api/getBill', function(req, res, next) {
  mymongo.find('bill_list',function(err,result){
    if(err){
      return res.json({code:0,data:err})
    }else{
      return res.json({code:1,data:result,msg:'查询成功'})
    }
  })
});

//根据类型查询列表
router.post('/api/getTypeBill', function(req, res, next) {
  var type = req.body.type;
  var uid = req.body.uid;
  if(!type || !uid){
    return res.json({code:0,data:'参数丢失'})
  }
  mymongo.find('bill_list',{type:type,uid:uid},function(err,result){
    if(err){
      return res.json({code:0,data:err})
    }else{
      return res.json({code:1,data:result})
    }
  })
});


//模糊查询，搜索
router.post('/api/getVagueBill', function(req, res, next) {
  //$regex (正则匹配）/ 
  // /关键字/
  var intro = new RegExp(req.body.intro);//   
  if(!intro){
    return res.json({code:0,data:'参数丢失'})
  }
  mymongo.find('bill_list',{intro:intro},function(err,result){
    if(err){
      return res.json({code:0,data:err})
    }else{
      return res.json({code:1,data:result})
    }
  })
});

//按时间查询(查询本月底)
router.post('/api/getTimeBill', function(req, res, next) {
 var timer = req.body.timer;// 当前时间
 if(!timer){
   return res.json({code:0,data:'参数丢失'})
 }

 var bigTimer = null; //结束时间
 if(timer.indexOf('-') != -1){ //是否存在年-月
  var timerArr = timer.split('-'); // ['2019','01','16']
  if(timerArr[1] == 12){ //如果是12 表示为最后一个月
    bigTimer = +timerArr[0]+1; //2020 给年加1
  }else{ //年+ 月+1 表示下一个月
    bigTimer = timerArr[0] + '-' + (+timerArr[1] + 1);
  }
 }
 //
 mymongo.find('bill_list',{timer:{'$lt':bigTimer,'$gte':timer}},function(err,result){ 
   if(err){
     return res.json({code:0,data:err})
   }else{
     return res.json({code:1,data:result})
   }
 })
});


//按时间模糊查询(查询本月)
router.post('/api/getVagueTimeBill', function(req, res, next) {
  var timer = new RegExp(req.body.timer);//当前时间 
  if(!timer){
    return res.json({code:0,data:'参数丢失'})
  }
  //如果是当前月查询本月，如果带日查询具体日
  mymongo.find('bill_list',{timer:timer},function(err,result){
    if(err){
      return res.json({code:0,data:err})
    }else{
      if(result.length == 0){
        return res.json({code:1,data:"没有相关数据！"})
      }
      return res.json({code:1,data:result})
    }
  })
 });


 //添加数据
 router.post('/api/addBill', function(req, res, next) {
  var timer = req.body.timer;// 
  var uid = req.body.uid;
  var icon = req.body.icon;
  var type = req.body.type;
  var money = req.body.money;
  var intro = req.body.intro;

  if(!timer || !uid || !icon || !timer || !type || !money || !intro){
    return res.json({code:0,data:'参数丢失'})
  }
  mymongo.find('bill_list',{uid:uid},function(err,result){
    if(err){
      return res.json({code:0,data:err})
    }else{
      if(result != 0){
        mymongo.insert('bill_list',{timer:timer,uid:uid,icon:icon,type:type,money:money,intro:intro},function(err,result){
          if(err){
            return res.json({code:0,data:err})
          }else{
            return res.json({code:1,data:result})
          }
        })
      }else{
        return res.json({code:0,data:"没有此用户！"})
      }
    }
  })
 });

 //修改数据
 router.post('/api/updateBill', function(req, res, next) {
  var timer = req.body.timer;// 
  var icon = req.body.icon;
  var type = req.body.type;
  var money = req.body.money;
  var intro = req.body.intro;
  var id = req.body.id;

  if(!timer || !icon || !timer || !type || !money || !intro){
    return res.json({code:0,data:'参数丢失'})
  }
  mymongo.update('bill_list',{_id:id},{timer:timer,icon:icon,type:type,money:money,intro:intro},function(err,result){
    if(err){
      return res.json({code:0,data:err})
    }else{
      return res.json({code:1,data:"修改成功！"})
    }
  })
 });

 //删除数据
 router.post('/api/deleteBill', function(req, res, next) {
  var id = req.body.id;
  if(!id){
    return res.json({code:0,data:'参数丢失'})
  }
  mymongo.delete('bill_list',{_id:id},function(err,result){
    if(err){
      return res.json({code:0,data:err})
    }else{
      return res.json({code:1,data:"删除成功！"})
    }
  })
 });

 
//分页（上拉加载）
router.post('/api/getScoll', function(req, res, next) {
  var page = req.body.page; //页数
  var len = req.body.len;//条数
  mymongo.find('bill_list',function(err,result){
    if(err){
      return res.json({code:0,data:err})
    }else{
      return res.json({code:1,data:result.slice((page - 1) * len , page * len) })
    }
  })
 });



 //上拉加载的分页
 //limit() ,skip()
 router.post('/api/getSkipScoll', function(req, res, next) {
  var page = req.body.page; //页数
  var len = req.body.len;//条数
  mongoClient.connect("mongodb://localhost:27017",{useNewUrlParser:true},function(err,con){
    if(err){
      throw err
    }
    var db = con.db('1610C');
    var collection = db.collection('bill_list');
    collection.find().skip((page - 1) * len).limit(len * 1).sort({'intro':1}).toArray(function(err,result){
        if(err){
          throw err
        }else{
          return res.json({code:1,data:result})
        }
    })
  })
 });

 //倒序排列
 router.post('/api/getSort', function(req, res, next) {
  var page = req.body.page; //页数
  var len = req.body.len;//条数
  mongoClient.connect("mongodb://localhost:27017",{useNewUrlParser:true},function(err,con){
    if(err){
      throw err
    }
    var db = con.db('1610C');
    var collection = db.collection('bill_list');
    collection.find().sort({'money':1}).toArray(function(err,result){
        if(err){
          throw err
        }else{
          return res.json({code:1,data:result})
        }
    })
  })
 });

module.exports = router;
