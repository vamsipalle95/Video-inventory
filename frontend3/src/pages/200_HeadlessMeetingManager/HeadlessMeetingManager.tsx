import React, { useEffect, useState } from "react";
import { useAppState } from "../../providers/AppStateProvider";
import { HMMCmd } from "../../providers/hooks/RealtimeSubscribers/useRealtimeSubscribeHMM";
import { useScheduler } from "../../providers/hooks/useScheduler";
import { LocalLogger } from "../../utils/localLogger";
import { RecorderView } from "./components/views/RecorderView";
import { useRecorder } from "./hooks/useRecorder";
import { useShareTileView } from "./hooks/useShareTileView";
import { useStatusMonitor } from "./hooks/useStatusMonitor";




type InternalStage = "Signining" | "Joining" | "Entering" | "Ready"
type State = {
    internalStage: InternalStage,
    userName: string | null
}
const logger = new LocalLogger("HeadlessMeetingManager")

const sleep = async(ms:number)=>{
    const p = new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
    await p
}


export const HeadlessMeetingManager = () => {
    //// Query Parameters
    const query = new URLSearchParams(window.location.search);
    const meetingName = query.get('meetingName') || null  // meeting name is already encoded
    const attendeeId  = query.get('attendeeId') || null
    const uuid        = query.get('uuid') || null
    const code        = query.get('code') || null // OnetimeCode
    // const decodedMeetingName =  decodeURIComponent(meetingName!)


    const { handleSinginWithOnetimeCode, joinMeeting, enterMeeting, attendees, sendHMMStatus, terminateCounter,
            audioInputDeviceSetting, videoInputDeviceSetting, audioOutputDeviceSetting, audioOutputList, sendHMMCommand, gameState,
            updateGameState} = useAppState()
    const [ state, setState] = useState<State>({internalStage:"Signining", userName:null})

    const { meetingActive } = useStatusMonitor()
    const { isRecording, setActiveCanvas, setAllCanvas, stopRecord } = useRecorder({meetingName:meetingName||"unknown"})
    const { isSharingTileView, setTileCanvas } = useShareTileView({meetingName:meetingName||"unknown"})
    const { tenSecondsTaskTrigger } = useScheduler()

    useEffect (()=>{
        console.log("HMM_SEND_STATUS------->",JSON.stringify(gameState))
        sendHMMCommand({command:HMMCmd.NOTIFY_AMONGUS_STATUS, data:gameState})
    },[gameState]) // eslint-disable-line




    const setTileCanvasExport = (canvas:HTMLCanvasElement) => {
        setAllCanvas(canvas)
        setTileCanvas(canvas)
    }


    const finalizeMeeting = async() =>{
        logger.log("meeting is no active. stop recording...")
        await stopRecord()
        logger.log("meeting is no active. stop recording...done. sleep 20sec")
        await sleep(20 * 1000)
        logger.log("meeting is no active. stop recording...done. sleep 20sec done.")
        logger.log("terminate event fire")

        const event = new CustomEvent('terminate');
        document.dispatchEvent(event)
        logger.log("terminate event fired")
    }
    useEffect(()=>{
        if(meetingActive===false){
            finalizeMeeting()
            sendHMMStatus(false, isRecording, isSharingTileView)
        }
    },[meetingActive]) // eslint-disable-line
    useEffect(()=>{
        if(terminateCounter>0){
            finalizeMeeting()
            sendHMMStatus(false, isRecording, isSharingTileView)
        }
    },[terminateCounter]) // eslint-disable-line


    useEffect(()=>{
        sendHMMStatus(true, isRecording, isSharingTileView)
    },[tenSecondsTaskTrigger]) // eslint-disable-line


    useEffect(()=>{
        if(state.internalStage === "Signining"){
            logger.log("Singining....")
            if(!meetingName || !attendeeId || !uuid || !code){
                logger.log(`"Exception: Signin error. Information is insufficent meetingName${meetingName}, attendeeId=${attendeeId}, uuid=${uuid}, code=${code}`)
                finalizeMeeting()
                sendHMMStatus(false, isRecording, isSharingTileView)
                return
            }
            handleSinginWithOnetimeCode(meetingName, attendeeId, uuid, code).then((res)=>{
                if(res.result){
                    setState({...state, userName: res.attendeeName||null, internalStage:"Joining"})
                }else{
                    logger.log("Exception: Signin error, can not sigin. please generate code and retry.", res)
                    finalizeMeeting()
                    sendHMMStatus(false, isRecording, isSharingTileView)
                }
            })
        }else if(state.internalStage === "Joining"){
            logger.log("Joining....")
            joinMeeting(meetingName!, `@Manager[${state.userName!}]`).then(()=>{
                setState({...state, internalStage:"Entering"})
            }).catch(e=>{
                logger.log("joining failed",e)
                finalizeMeeting()
                sendHMMStatus(false, isRecording, isSharingTileView)
            })
        }else if(state.internalStage === "Entering"){
            logger.log("entering...")
            const p1 = audioInputDeviceSetting!.setAudioInput("dummy")
            const p2 = videoInputDeviceSetting!.setVideoInput(null)
            videoInputDeviceSetting!.setVirtualForegrounEnable(false)
            videoInputDeviceSetting!.setVirtualBackgrounEnable(false)    
            const audioOutput = (audioOutputList && audioOutputList!.length > 0) ? audioOutputList[0].deviceId:null
            logger.log("Active Speaker::::::audio", audioOutput?audioOutput:"null")
            const p3 = audioOutputDeviceSetting!.setAudioOutput(audioOutput)
            // const p3 = audioOutputDeviceSetting!.setAudioOutput(null)

            enterMeeting().then(()=>{
                Promise.all( [p1, p2, p3] ).then(()=>{
                    setState({...state, internalStage:"Ready"})
                    // setStage("HEADLESS_MEETING_MANAGER2")
                })
            }).catch(e=>{
                logger.log("enter meeting failed",e)
                finalizeMeeting()
                sendHMMStatus(false, isRecording, isSharingTileView)
            })
        }else if(state.internalStage === "Ready"){
            logger.log("ready....")
            const audioElement = document.getElementById("for-speaker")! as HTMLAudioElement
            audioElement.autoplay=false
            audioElement.volume = 0
            audioOutputDeviceSetting!.setOutputAudioElement(audioElement)
        }
    },[state.internalStage]) // eslint-disable-line
    
    return (
        <>
            <RecorderView height={200} width={500} setActiveRecorderCanvas={setActiveCanvas} setAllRecorderCanvas={setTileCanvasExport}/>
            <div>recording:{isRecording?"true":"false"}</div>
            <div>ATTTENDEES:{Object.keys(attendees).map(x=>{return `[${x}]`})}</div>

            <a id="activeVideoLink">active speaker</a>
            <a id="allVideoLink">all speaker</a>

            <div>
                <audio id="for-speaker" style={{display:"none"}}/>
            </div>


            <div>
                <input id="io_event"/>
                <input id="io_data"/>
                <button id="io_click" onClick={()=>{
                    const ev = document.getElementById("io_event") as HTMLInputElement
                    const data = document.getElementById("io_data") as HTMLInputElement
                    console.log("RECEIVE DATA:", ev.value)
                    console.log("RECEIVE DATA:", data.value)
                    updateGameState(ev.value, data.value)
                }} />
            </div>
        </>
    )
}
