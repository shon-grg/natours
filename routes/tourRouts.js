const  express=require('express')
const toutController =require('./../controllers/tourController');
const authController =require('./../controllers/authController')
const reviewRouter =require('./../routes/reviewRouts')


const router =express.Router();

//nested parameter merged
router.use('/:tourId/reviews',reviewRouter)

router
.route('/top-5-cheap')
.get(toutController.aliasTopTours,
    toutController.getAllTours);

router
.route('/tour-starts')
.get(toutController.getTourStatus);

router
.route('/monthly-plan/:year')
.get(
    authController.protect,
    authController.restrictTo('admin','lead-guide','guide'),
    toutController.getMonthlyPlan
    );


router
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(toutController.getTourWithin);
//tours-distance?distance=233&center=-40,45,unit=ml
// /tours-within/400/center/34.111445,-118.113491/unit/ml


router.route('/distances/:latlng/unit/:unit').get(toutController.getDistances)

router
.route('/')
.get(toutController.getAllTours) 
.post(authController.protect,
    authController.restrictTo('admin','lead-guide'),
     toutController.createTour);

router
.route('/:id')
.get( toutController.getTour)
.patch( authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toutController.resizeTourImages,
    toutController.updateTour)
.delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toutController.deleteTour);




//EXPORT ROUTER TO APP.JS
module.exports =router; 