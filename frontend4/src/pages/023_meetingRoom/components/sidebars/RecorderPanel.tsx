import React, { useMemo, useState }  from 'react';
import { Button, CircularProgress, Tooltip, Typography } from '@material-ui/core';
import { Pause, FiberManualRecord } from '@material-ui/icons'
import { useStyles } from './css';
import { useAppState } from '../../../../providers/AppStateProvider';
import { DefaultDeviceController } from 'amazon-chime-sdk-js';
import { useVideoComposeCanvas, useRecorder } from '@dannadori/flect-chime-lib'


export const RecorderPanel = () => {
    const classes = useStyles();
    const { chimeClient } = useAppState()

    const [ sourceVideo, setSourceVideo] = useState<HTMLCanvasElement | HTMLVideoElement | MediaStream | null>(null)


    // const { activeRecorder, audioInputDeviceSetting } = useAppState()
    // const  [recorderCanvas, setRecorderCanvas] = useState<HTMLCanvasElement|null>(null)
    // const [ isEncoding, setIsEncoding ] = useState(false)
    // const [ isRecording, setIsRecording ] = useState(false)

    // const handleOnClickStartRecord = async() =>{
    //     setIsRecording(true)
    //     const stream =  new MediaStream();
    //     const audioElem = document.getElementById("for-speaker") as HTMLAudioElement

    //     // @ts-ignore
    //     const audioStream = audioElem.captureStream() as MediaStream
    //     let localAudioStream = audioInputDeviceSetting?.audioInputForRecord
    //     if(typeof localAudioStream === "string"){
    //         localAudioStream = await navigator.mediaDevices.getUserMedia({audio:{deviceId:localAudioStream}})
    //     }

    //     const audioContext = DefaultDeviceController.getAudioContext();
    //     const outputNode = audioContext.createMediaStreamDestination();
    //     const sourceNode1 = audioContext.createMediaStreamSource(audioStream);
    //     sourceNode1.connect(outputNode)
    //     if(localAudioStream){
    //         const sourceNode2 = audioContext.createMediaStreamSource(localAudioStream as MediaStream);
    //         sourceNode2.connect(outputNode)
    //     }
    //     // @ts-ignore
    //     const videoStream = recorderCanvas.captureStream() as MediaStream

    //     [outputNode.stream, videoStream].forEach(s=>{
    //         s?.getTracks().forEach(t=>{
    //             console.log("added tracks:", t)
    //             stream.addTrack(t)
    //         })
    //     });
    //     activeRecorder?.startRecording(stream)
    // }

    // const handleOnClickStopRecord = async() =>{
    //     activeRecorder?.stopRecording()
    //     setIsEncoding(true)
    //     await activeRecorder?.toMp4()
    //     console.log("---------------------------------------------------- 1")
    //     setIsEncoding(false)
    //     console.log("---------------------------------------------------- 2")
    //     setIsRecording(false)
    //     console.log("---------------------------------------------------- 3")
    // }

    // const startButton = useMemo(()=>{
    //     return isRecording === false && isEncoding === false ? 
    //     (
    //         <Tooltip title={activeRecorder?.isRecording?"stop recording":"start recording"}>
    //             <Button
    //                 size="small"
    //                 variant="outlined"
    //                 className={activeRecorder?.isRecording ? classes.activatedButton : classes.button}
    //                 startIcon={<FiberManualRecord />}
    //                 onClick={handleOnClickStartRecord}
    //                 id="recorder-start"
    //             >
    //                 Rec.
    //             </Button>
    //         </Tooltip> 
    //     )
    //     :
    //     (
    //         <Tooltip title={activeRecorder?.isRecording?"stop recording":"start recording"}>
    //             <Button
    //                 size="small"
    //                 variant="outlined"
    //                 className={activeRecorder?.isRecording ? classes.activatedButton : classes.button}
    //                 startIcon={<FiberManualRecord />}
    //                 id="recorder-start"
    //             >
    //                 Rec.
    //             </Button>
    //         </Tooltip> 

    //     )
    // },[isRecording, isEncoding, recorderCanvas])  // eslint-disable-line

    // const stopButton = useMemo(()=>{

    //     if(isRecording === false && isEncoding === false){
    //         return <Tooltip title={activeRecorder?.isRecording?"stop recording":"start recording"}>
    //             <Button
    //             size="small"
    //             variant="outlined"
    //             className={classes.button}
    //             startIcon={<Pause />}
    //             disabled
    //             id="recorder-stop"
    //             >
    //                 Stop
    //             </Button>
    //         </Tooltip> 
    //     }else if(isRecording === true && isEncoding === false){
    //         return <Tooltip title={activeRecorder?.isRecording?"stop recording":"start recording"}>
    //             <Button
    //             size="small"
    //             variant="outlined"
    //             className={classes.button}
    //             startIcon={<Pause />}
    //             onClick={handleOnClickStopRecord}
    //             id="recorder-stop"
    //             >
    //                 Stop
    //             </Button>
    //         </Tooltip> 
    //     }else if(isRecording === true && isEncoding === true){
    //         return  <CircularProgress />
    //     }
    // },[isRecording, isEncoding, recorderCanvas])  // eslint-disable-line

    // return (
    //     <div className={classes.root}>
    //         <Typography className={classes.title} color="textSecondary">
    //             Push REC button to start recording. Push STOP button to end recording and download file.
    //             Note: Please confirm the screen below shows the movie you want to record. 
    //             Depends on the browser or its version, you should display the screen below in order to update image on the screen below.
    //         </Typography>

    //         {startButton}
    //         {stopButton}

    //         <RecorderView height={200} width={200} setRecorderCanvas={setRecorderCanvas}/>
    //     </div>
    // );

    const notifyVideoStream = (ms:MediaStream) =>{ 
        console.log("MediaStream:", ms)
        setSourceVideo(ms)
    }

    // const [r, sr] = useState(useVideoComposeCanvas({
    //     chimeClient:chimeClient!,
    //     mode: "ALL",
    //     canvasWidth:640,
    //     canvasHeight:480,
    //     displayWidth:64,
    //     displayHeight:48,
    //     drawTitle:true,
    //     notifyVideoStream:notifyVideoStream,
    //     framerate:15
    // }))
    
    const r1 = useVideoComposeCanvas({
        chimeClient:chimeClient!,
        mode: "ALL",
        canvasWidth:640,
        canvasHeight:480,
        displayWidth:64,
        displayHeight:48,
        drawTitle:true,
        notifyVideoStream:notifyVideoStream,
        framerate:15
    })


    // const sourceLocalAudio = useMemo(()=>{
    //     if(chimeClient!.audioInputDeviceSetting?.audioInputForRecord instanceof MediaStream){
    //         return chimeClient!.audioInputDeviceSetting?.audioInputForRecord
    //     }else if(typeof chimeClient!.audioInputDeviceSetting?.audioInputForRecord === "string"){
    //         return navigator.mediaDevices.getUserMedia({audio:{deviceId:chimeClient!.audioInputDeviceSetting?.audioInputForRecord}})
    //     }else{
    //         return null
    //     }
    // },[chimeClient!.audioInputDeviceSetting?.audioInputForRecord])
    const { started, start, stop } = useRecorder({
        sourceVideo: sourceVideo,
        sourceLocalAudio: chimeClient!.audioInputDeviceSetting!.audioInputForRecord,
        sourceRemoteAudio: chimeClient!.audioOutputDeviceSetting!.outputAudioElement,
        filename: "testfile.mp4"
    })

    return(
        <div style={{display:"flex", flexDirection:"column"}}>
            {r1.videoComposeCanvas}
            <Button onClick={r1.toggleEnable}>aaaa</Button>
            <div>
                {started? "STARTED!!": "STOPPED"}
            </div>

            <div>
                <Button onClick={start}>start</Button>
            </div>
            <div>
                <Button onClick={stop}>stop</Button>
            </div>
        </div>
    )
}