import { useEffect, useMemo, useState } from "react"
import { VideoTileState } from "amazon-chime-sdk-js";
import { AttendeeState, ChimeClient } from "../helper/ChimeClient";
import { Recorder } from "../helper/Recorder";
import { getMeetingInfo } from "../../api/api";
import { useScheduler } from "./useScheduler";
import * as api from '../../api/api'

type UseMeetingStateProps = {
    userId?: string, 
    idToken?: string, 
    accessToken?: string, 
    refreshToken?: string
}

export const useMeetingState = (props:UseMeetingStateProps) => {
    const [stateCounter, setStateCounter] = useState(0) // Used for notifying chimeClient internal change.

    const [userName, setUserName] = useState("")
    const [meetingName, setMeetingName] = useState("")
    const [meetingId, setMeetingId] = useState("")
    const [joinToken, setJoinToken] = useState("")
    const [attendees, setAttendees] = useState<{ [attendeeId: string]: AttendeeState }>({})
    const [videoTileStates, setVideoTileStates] = useState<{ [attendeeId: string]: VideoTileState }>({})
    const [isShareContent, setIsShareContent] = useState(false)
    const [activeSpeakerId, setActiveSpeakerId] = useState<string|null>(null)
    const [attendeeId, setAttendeeId] = useState<string>("")
    const [ownerId, setOwnerId] = useState("")
    const [isOwner, setIsOwner] = useState(false)

    const chimeClient = useMemo(()=>{return new ChimeClient()},[])
    const {tenSecondsTaskTrigger} = useScheduler()

    // For Recorder
    const activeRecorder    = useMemo(()=>{return new Recorder()},[])
    const allRecorder       = useMemo(()=>{return new Recorder()},[])


    if(props.userId && props.idToken && props.accessToken && props.refreshToken){
        chimeClient.init(props.userId, props.idToken, props.accessToken, props.refreshToken)
        chimeClient.userNameUpdated = (val:string) => {setUserName(val)}
        chimeClient.meetingNameUpdated = (val:string) => {setMeetingName(val)}
        chimeClient.meetingIdUpdated = (val:string) => {setMeetingId(val)}
        chimeClient.joinTokenUpdated = (val:string) => {setJoinToken(val)}
        chimeClient.attendeesUpdated = (val:{ [attendeeId: string]: AttendeeState } ) => {setAttendees({...val})}
        chimeClient.videoTileStatesUpdated = (val:{ [attendeeId: string]: VideoTileState } ) => {setVideoTileStates({...val})}
        chimeClient.isShareContentUpdated = (val:boolean) =>{setIsShareContent(val)}
        chimeClient.activeSpeakerIdUpdated = (val:string|null)=>{
            console.log("[ActiveSpeaker] update", val)
            setActiveSpeakerId(val)
        }
        chimeClient.attendeeIdUpdated = (val:string) =>{setAttendeeId(val)}
    }

    const createMeeting = chimeClient.createMeeting
    // const joinMeeting = chimeClient.joinMeeting

    const joinMeeting = async (meetingName: string, userName: string) => {
        await chimeClient.joinMeeting(meetingName, userName)
        setStateCounter(stateCounter + 1 )
    }
    
    const enterMeeting = async () => {
        await chimeClient.enterMeeting()
        updateMeetingInfo()
        setStateCounter(stateCounter + 1 )
    }
    const leaveMeeting = async() =>{
        await chimeClient.leaveMeeting()
        setStateCounter(stateCounter + 1 )
    }
    const countAttendees = chimeClient.countAttendees
    const meetingSession = chimeClient._meetingSession
    const audioInputDeviceSetting = chimeClient._audioInputDeviceSetting
    const videoInputDeviceSetting = chimeClient._videoInputDeviceSetting
    const audioOutputDeviceSetting = chimeClient._audioOutputDeviceSetting



    ////////////////////////
    // Features
    ///////////////////////
    const startShareScreen = async () => {
        try{
            // @ts-ignore https://github.com/microsoft/TypeScript/issues/31821
            const media = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true } )
            chimeClient.startShareContent(media)
        }catch(e){
            console.log(e)
        }
    }
    const stopShareScreen = async () => {
        chimeClient.stopShareContent()
    }



    ////////////////////////
    // Util
    ///////////////////////
    const getUserNameByAttendeeIdFromList = (attendeeId: string) => {
        return attendees[attendeeId] ? attendees[attendeeId].name : attendeeId
    }

    const updateMeetingInfo = async () =>{
        const meetingInfo = await getMeetingInfo(meetingName, props.idToken!, props.accessToken!, props.refreshToken!)
        console.log(meetingInfo)
        console.log("new ownerId", ownerId)

        setIsOwner(meetingInfo.IsOwner)
    }

    const setPauseVideo = (attendeeId:string, pause:boolean) =>{
        console.log("SET PAUSE VIDEO", attendeeId, pause)
        chimeClient.setPauseVideo(attendeeId, pause)
    }

    ///////////////////////////
    /// for recovery
    ///////////////////////////
    //// Retrieve attendee name
    useEffect(()=>{
        (async() => {
            let updated = false
            for(let x of Object.values(attendees)){
                if(x.name === x.attendeeId){
                    try{
                        const res = await api.getUserNameByAttendeeId(meetingName, x.attendeeId, props.idToken!, props.accessToken!, props.refreshToken!)
                        x.name = res.name
                        updated = true
                    }catch(exception){
                        console.log(`username update failed ${x.attendeeId}`)
                    }
                }
            }
            if(updated){
                setAttendees({...attendees})
            }
        })()
    },[tenSecondsTaskTrigger]) // eslint-disable-line

    return { meetingName, meetingId, joinToken, attendeeId, userName, attendees, videoTileStates, 
            meetingSession, activeRecorder, allRecorder, audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting,
            isShareContent, activeSpeakerId,
            createMeeting, joinMeeting, enterMeeting, leaveMeeting,
            startShareScreen, stopShareScreen,
            getUserNameByAttendeeIdFromList,
            countAttendees,

            updateMeetingInfo, ownerId, isOwner,
            setPauseVideo, 
        }



}