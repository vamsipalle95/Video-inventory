import { useEffect, useState } from "react"
import { useAppState } from "../../../providers/AppStateProvider"
import { useScheduler } from "../../../providers/hooks/useScheduler"


export const useStatusMonitor = () =>{

    const { tenSecondsTaskTrigger } = useScheduler()
    const { attendees, attendeeId } = useAppState()
    const [ meetingActive, setMeetingActive ] = useState(true)
    const [ noAttendeesCount, setNoAttendeesCount] = useState(0)

    useEffect(()=>{
        if(!attendeeId){ // not yet ready
            return
        }
        //// exclude hmm and shared contents
        let meetingActive = true
        const pureAttendees = Object.keys(attendees).filter(x =>{return x.indexOf(attendeeId) < 0})
        if(pureAttendees.length > 0){
            meetingActive = true
        }else{
            meetingActive = false
        }

        console.log("meetingActive1:", meetingActive, pureAttendees)
        const attendeeList = pureAttendees.reduce((prev,cur)=>{return prev+"_____"+cur}, "")
        console.log(`meetingActive2:${attendeeList}`)
        
        if(meetingActive){
            setNoAttendeesCount(0)
        }else{
            setNoAttendeesCount(noAttendeesCount + 1)
            console.log(`meetingActive checker count: ${noAttendeesCount}`)
            if(noAttendeesCount > 3){
                setMeetingActive(false)
            }
        }
    },[tenSecondsTaskTrigger])
    return {meetingActive}
}