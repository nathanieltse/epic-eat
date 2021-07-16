import { useEffect, useState } from 'react'
import NavBar from '../../components/NavBar/NavBar'
import axios from 'axios'
import searchRec from '../../assets/animation/searchRec.json'
import Lottie from 'react-lottie'
import heart from '../../assets/icons/heart.svg'
import cross from '../../assets/icons/dislike_cross.svg'
import PickReason from '../../components/PickReason/PickReason'
import './RecommendationPage.scss'

const RecommendationPage = ({latitude, longitude, handleSelect}) => {
        const [pickReason, setPickReason] = useState(null)
        const [userRec , setUserRec] = useState([])
        const [currentView, setCurrentView] = useState(null)
        const [nextView, setNextView] = useState(null)
        const [like, setLike] = useState("")
        const [dislike, setDislike] = useState("")

        const userToken = localStorage.getItem("usertoken")

        useEffect(()=>{
            displayRec(userRec)
        },[userRec])


        const picked = (reason) => {
            setPickReason(reason)
            
            let lastpickReason = sessionStorage.getItem("lastpickReason")
            const userRecArr = JSON.parse(sessionStorage.getItem("userRec"))

            if (!!userRecArr && reason === lastpickReason){
                setUserRec(userRecArr)
            } else {
                axios
                    .get('/api/recommendation',{
                        headers:{
                        authorization:`bearer ${userToken}`
                        },
                        params:{
                            latitude:latitude,
                            longitude:longitude,
                            reason:reason,
                            mealTime:mealTime()
                        }
                    })
                    .then(res => {
                        sessionStorage.setItem("userRec",(JSON.stringify(removeDuplicate(res.data))))
                        setUserRec(JSON.parse(sessionStorage.getItem("userRec")))
                    })
                    .catch(err => {
                        console.log(err)
                    })
            } 
            sessionStorage.setItem("lastpickReason",reason)
        }

        const displayRec = (recArr) => {
            if (!!recArr.length){
                const selectIndex = Math.floor(Math.random() * recArr.length)
                let nextIndex = Math.floor(Math.random() * recArr.length)
                if(!nextView){
                    while (nextIndex){
                        if (selectIndex === nextIndex){
                            nextIndex = Math.floor(Math.random() * recArr.length)
                        }
                        break
                    }
                setCurrentView(recArr[selectIndex])
                setNextView(recArr[nextIndex])
                } else {
                    let nextIndex = Math.floor(Math.random() * recArr.length)

                    while (nextIndex){
                        if (nextView.id === recArr[nextIndex].id){
                            nextIndex = Math.floor(Math.random() * recArr.length)
                        }
                        break
                    }
                    setCurrentView(nextView)
                    setNextView(recArr[nextIndex])
                }
            } else {
                setCurrentView(null)
                setNextView(null)
            }
            
            
        }


        const removeDuplicate = (arr) => {
            let newArr = []

            arr.forEach(item => {
                if(!newArr.find(item2 => item2.id === item.id)){
                    newArr.push(item)
                }
            })

            return newArr

        }

        const userAction = (id, action) => {
            if(action === "like"){
                setLike(currentView.id)
            } else {
                setDislike(currentView.id)
            }

            let newRec = userRec.filter(rec => rec.id !== id)
            setTimeout(() => {
                if (!!newRec.length){
                    sessionStorage.setItem("userRec",(JSON.stringify(newRec)))
                    setUserRec(newRec) 
                } else{
                    sessionStorage.removeItem("userRec")
                    setUserRec([])   
                } 
            }, 800)
        }

        const mealTime = () => {
            const timeNow = new Date().getHours()
            if (timeNow < 4){
                return "nightlife"
            } else if (timeNow < 10){
                return "breakfast"
            } else if( timeNow < 12){
                return "brunch"
            } else if( timeNow < 17) {
                return "lunch"
            } else if( timeNow < 22){
                return "dinner"
            } else {
                return "nightlife"
            }
        }

        const searchAni = {
            loop: true,
            autoplay: true,
            animationData: searchRec,
            rendererSettings: {
                preserveAspectRatio: "xMidYMid slice",
            }
        }


        
        
        return(
            <section className="RecommendationPage">
                {!pickReason && latitude && <PickReason picked={picked}/>}
                {currentView && pickReason && latitude?
                 <section className="RecommendationPage__image">
                     
                        {nextView && 
                            <div className="RecommendationPage__image-wrapper">
                                <div className="RecommendationPage__image-text">
                                    <h1 className="RecommendationPage__image-title">{nextView.name}</h1>
                                    <p className="RecommendationPage__image-distance">{(nextView.distance/1000).toFixed(1)} km away</p>
                                </div>
                                <img className="RecommendationPage__image-image" src={nextView.image_url} alt={nextView.name}/>
                            </div>
                        }
                        <div 
                            onClick={() => handleSelect(currentView)}
                            className={currentView.id === dislike? "RecommendationPage__image-wrapper RecommendationPage__image-wrapper--like" :
                                        currentView.id === like? "RecommendationPage__image-wrapper RecommendationPage__image-wrapper--dislike" :
                                        "RecommendationPage__image-wrapper"}>
                            <div className="RecommendationPage__image-text">
                                <h1 className="RecommendationPage__image-title">{currentView.name}</h1>
                                <p className="RecommendationPage__image-distance">{(currentView.distance/1000).toFixed(1)} km away</p>
                            </div>
                            <img className="RecommendationPage__image-image" src={currentView.image_url} alt={currentView.name}/>
                        </div>
                </section>
                :
                pickReason && <section className="RecommendationPage__image RecommendationPage__image--loading">
                    <Lottie  options={searchAni} height={300} width={300}/>
                    {like || dislike ? 
                        <h1 className="RecommendationPage__image-loading-text">That's all we can find for the moment. Try picking other occasions.</h1>
                        :
                        <h1 className="RecommendationPage__image-loading-text">Looking for your new favourite</h1>
                    }
                </section>
                }
                {pickReason &&
                    <section className="RecommendationPage__button-container">
                        <button className="RecommendationPage__button" onClick={()=>userAction(currentView.id, "like")}>
                        <img className="RecommendationPage__button-icon" src={cross} alt="cross icon"/>
                        </button>
                        <button className="RecommendationPage__button" onClick={()=>userAction(currentView.id, "dislike")}>
                            <img className="RecommendationPage__button-icon" src={heart} alt="heart icon"/>
                        </button>
                    </section>
                }
                <NavBar onPage="recommends"/>
            </section>
        )
    
}

export default RecommendationPage
