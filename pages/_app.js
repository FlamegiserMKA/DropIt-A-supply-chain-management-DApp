import "../style/global.css"

//INTERNAL IMPORT
import { TrackingProvider } from "../Context/Tracking";
import { NavBar, Footer} from "../components";

export default function App({ Component, pageProps}){
    return (
            <TrackingProvider>
                <NavBar/>
                <Component {...pageProps} />
                <Footer/>
            </TrackingProvider>
    );
}