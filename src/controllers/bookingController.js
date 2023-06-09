const catchAsync = require('../utils/catchAsync')
const Tour = require('../models/tourModel')
const AppError = require('../utils/appError')
const User = require('../models/userModel')
const Booking = require('../models/bookingModel')
const factory = require('../controllers/handlerFactory')
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

exports.getCheckoutSession = catchAsync(async (req, res, next) =>{
    //get the currently tour
    const tour = await Tour.findById(req.params.tourID)
    //2 create check out session
    const session = await stripe.checkout.sessions.create({
        payment_method_types : ['card'],
        success_url : `${req.protocol}://${req.get('host')}/?tour=${req.params.tourID}&user=${req.user.id}&price=${tour.price}`,
        cancel_url : `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email : req.user.email,
        client_refrence_id : req.params.tourId,
        line_items : [
            {
                name: `${tour.name} Tour`,
                description :tour.summary,
                images : [`https://www.natours.dev/img/tours/${tour.imageCover}`],
                amount : tour.price * 100,
                currency : 'usd',
                quantity : 1
            }
        ]
    })
    //3 create session as respnse
    res.status(200).json({
        status : 'success',
        session
    })
} )

exports.createBookingCheckout = catchAsync( async(req, res, next) =>{
    const {tour, user, price} = req.query
    if(!tour && !user && !price){
        return next()
    }
    else{
        await Booking.create({tour, user, price})
        res.redirect(req.originalUrl.split('?')[0])
    }
} )

exports.createBooking = factory.createOne(Booking)
exports.getBooking = factory.getOne(Booking)
exports.getAllBooking = factory.getAll(Booking)
exports.updateBooking = factory.updateOne(Booking)
exports.deleteBooking = factory.deleteOne(Booking)