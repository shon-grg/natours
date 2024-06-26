const multer=require('multer')
const sharp =require('sharp')
const Tour=require('./../models/tourModel');
const catchAsync =require('./../utils/catchAsync');
const factory =require('./handlerFactory');
const AppError =require('./../utils/appError');


const multerStorage=multer.memoryStorage()

const multerFilter =(req,file,cb)=>{
    if(file.mimetype.startsWith('image')){
        cb(null,true)
    }else{
        cb(new AppError('not an image! Please upload only images.',400),false)
    }
}

const upload =multer({
    storage:multerStorage,
    fileFilter:multerFilter
});

exports.uploadTourImages=upload.fields([
    {name:'imageCover',maxCount:1},
    {name:'images',maxCount:3}
])

// upload.single('image')
// upload.array('image',5)




 exports.resizeTourImages=catchAsync(async(req,res,next)=>{
    if(!req.files.imageCover || !req.files.images)  return next()
// 1)Cover Image
 req.body.imageCover =`tour-${req.params.id}-${Date.now()}-cover.jpeg`
//  await sharp(req.files.imageCover[0].buffer)
 await sharp(req.file.imageCover.buffer)


  .resize(2000, 1333)
  .toFormat('jpeg')  
  .jpeg({quality:90})
  .toFile(`public/img/tours/${req.body.imageCover}`)


 //  2)images 
 req.body.image =[];

 await promises.all (req.body.images.map(async(file,i)=>{
    const filename=`tour-${req.params.id}-${Date.now()}-${i+1}.jpeg`

    await sharp(file.buffer)
  .resize(2000, 1333)
  .toFormat('jpeg')
  .jpeg({quality:90})
  .toFile(`public/img/tours/${filename}`)

  req.body.images.push(filename)
}))
 
  next()
});






exports.aliasTopTours=(req,res,next)=>{
  req.query.limit ='5'
  req.query.sort = '-ratingsAverage,price';
  req.query.fields='name,price,ratingsAverage,summary,difficulty';
  next();
}  
                                    
//API CREATE AND EXPORT TO TOUR ROUTS.JS

exports.getAllTours = factory.getAll(Tour)
exports.getTour = factory.getOne(Tour,{path:'reviews'})
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)                       
exports.deleteTour =factory.deleteOne(Tour)


exports.getTourStatus =catchAsync(async(req,res,next)=>{
      const stats =await Tour.aggregate([
        {
            $match:{ratingsAverage:{$gte:4.5}}
        },
        {
        $group:{
            _id: {$toUpper:'$difficulty'},
            numTours:{$sum:1},
            numRatings:{$sum:'$ratingQuantity'},
            avgRating:{$avg:'$ratingsAverage'},
            avgPrice:{$avg:'$price'},
            minPrice:{$min:'$price'},
            maxPrice:{$max:'$price'},
        } 
    },
    {
        $sort:{avgPrice:1 }
    },
    // {
    //     $match:{ _id:{$ne:'EASY'}}
    // }
    ]);
    res.status(200).json({
        status:'success',
        data:{
            stats
        }
       })  ;
});

//Aggregation pipeline 
exports.getMonthlyPlan =catchAsync(async(req,res,next)=>{
    const year = req.params.year*1;

    const plan=await Tour.aggregate([
        {
            $unwind:'$startDates'
        },
        { 
            $match:{
                startDates:{
                    $gte:new Date(`${year}-01-01`),
                    $lte:new Date(`${year}-12-31`),
                }
            } 
        },
        {
            $group:{
                _id:{$month:'$startDates'},
                numTourStarts:{$sum:1},
                tours:{$push:'$name'}
            }
        },
        {
            $addFields:{month:'$_id'}
        },
        {
            $project:{
                _id:0
            }
        },
        {
           $sort:{numTourStarts:-1} 
        },
        {
            $limit:12
        }
    ]); 
    res.status(200).json({
        status:'success',
        data:{
            plan
        }
       });
}); 


///tours-within/:distance/center/:latIng/unit/;unit
//tours-within/233/center/21.881890,76.596680/unit/ml

exports.getTourWithin=catchAsync(async(req,res,next)=>{
  const {distance,latlng,unit}=req.params;
  const [lat,lng]= latlng.split(',');

const radius =unit ==='ml'?distance/3963.2:distance/6378.1;
  if(!lat||!lng){
    next(
    new AppError(
        'Please provide latitude and longitude in the format lat,ing',
        400
   )
  );
  }

  const tours=await Tour.find({
    startLocation:{$geoWithin: { $centerSphere: [[lng, lat], radius ] } }
});

   res.status(200).json({
    status:'success',
    result:tours.length,
    data:{
        data:tours
      }
      })
});


exports.getDistances =catchAsync(async(req,res,next)=>{
    const {latlng,unit}=req.params;
    const [lat,lng]= latlng.split(',');

    const multiplier =unit==='ml'? 0.000621371:0.001
  
if(!lat||!lng){
      next(
      new AppError(
          'Please provide latitude and longitude in the format lat,ing',
          400
     ) 
    );
    }

  const distances= await Tour.aggregate([
    {
        $geoNear:{
            near: {
                type:'Point',
                coordinates:[lng*1,lat*1]
            },
            distanceField:'distance',
            distanceMultiplier:multiplier 
        },
    },
    {
        $project:{
            distance:1,
            name:1
        }
    }
  ]);
  res.status(200).json({
    status:'success',
    data:{
        data:distances
      }
      })

})