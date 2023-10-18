import axios from "axios"
import { showAlert } from "./alert";
const stripe = Stripe('pk_test_51O26ptSFVBSVbYKReKFaO6JmNTISZf1URDYpLOf9PjQ7q9ArXRUbHMF41CW4hcemYGuVtBCHT7p5taEwInF4ijbr00M0HYeDNl')


export const bookTour =async tourId=>{
    try{
    //1)Get checkout session from API
    const session=await axios(
        // `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
        `/api/v1/bookings/checkout-session/${tourId}`
        );
        console.log(session);

    // 2)create checkout form + charge credit card
    await stripe.redirectToCheckout({
        sessionId:session.data.session.id 
    })
    }catch(err){
        console.log(err);
        showAlert('error',err)
    }
};