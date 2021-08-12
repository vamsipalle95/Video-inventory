import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem, Select, Typography } from "@material-ui/core"
import React, { useState } from "react"
import { useAppState } from "../../../../providers/AppStateProvider"
import { useStyles } from "../../css"
import { DefaultDeviceController } from "amazon-chime-sdk-js";

type SettingDialogProps={
    open:boolean,
    onClose:()=>void
}

export const SettingDialog = (props:SettingDialogProps) =>{
    const classes = useStyles()
    const { chimeClient, audioInputList, videoInputList, audioOutputList } = useAppState()

    const [guiCounter, setGuiCounter] = useState(0)

    const onInputVideoChange = async (e: any) => {
        //// for input movie experiment [start]
        const videoElem = document.getElementById("for-input-movie")! as HTMLVideoElement
        videoElem.pause()
        videoElem.srcObject=null
        videoElem.src=""

        //// for input movie experiment [end]

        if (e.target.value === "None") {
            await chimeClient!.videoInputDeviceSetting!.setVideoInput(null)
            chimeClient!.videoInputDeviceSetting!.stopLocalVideoTile()
            setGuiCounter(guiCounter+1)
        } else if (e.target.value === "File") {
            // fileInputRef.current!.click()
        } else {
            await chimeClient!.videoInputDeviceSetting!.setVideoInput(e.target.value)
            chimeClient!.videoInputDeviceSetting!.startLocalVideoTile()
            setGuiCounter(guiCounter+1)
        }
    }
    // const setInputMovieFile = (path:string, fileType:string) =>{
    const setInputMovieFile = (noise:boolean) =>{
        const input = document.createElement("input")
        input.type = "file"
        input.onchange = (e: any) => {
            const path = URL.createObjectURL(e.target.files[0]);
            const fileType = e.target.files[0].type
            console.log(path, fileType)
            if(fileType.startsWith("video")){
                const videoElem = document.getElementById("for-input-movie")! as HTMLVideoElement
                videoElem.pause()
                videoElem.srcObject=null
    

                videoElem.onloadeddata = async (e) =>{
                    // @ts-ignore
                    const mediaStream = videoElem.captureStream() as MediaStream
    
    
                    /////// Generate AudioInput Source
                    let stream:MediaStream|null =  new MediaStream();
                    if(mediaStream.getAudioTracks().length>0){
                        mediaStream.getAudioTracks().forEach(t=>{
                            console.log("AUDIO TRACK",t)
                            stream!.addTrack(t)
                        })
                        console.log("AUDIO ",stream)
                        // audioInputDeviceSetting!.setAudioInput(mediaStream)
                    }else{
                        stream = null
                        console.log("NO AUDIO TRACK")
                        // audioInputDeviceSetting!.setAudioInput(null)
                    }
    
    
                    const audioContext = DefaultDeviceController.getAudioContext();
                    const outputNode = audioContext.createMediaStreamDestination();
                    if(stream){
                        const sourceNode = audioContext.createMediaStreamSource(stream);
                        sourceNode.connect(outputNode)
                    }
    
                    if(noise){
                        const outputNodeForMix = audioContext.createMediaStreamDestination();
                        const gainNode = audioContext.createGain();
                        gainNode.gain.value = 0.1;
                        gainNode.connect(outputNodeForMix);
                        const oscillatorNode = audioContext.createOscillator();
                        oscillatorNode.frequency.value = 440;
                        oscillatorNode.connect(gainNode);
                        oscillatorNode.start();
                        chimeClient!.audioInputDeviceSetting!.setBackgroundMusic(outputNodeForMix.stream)
                    }
                    chimeClient!.audioInputDeviceSetting!.setAudioInput(outputNode.stream) 

                    /////// Generate VideoInput Source
                    if(mediaStream.getVideoTracks().length>0){
                        const stream =  new MediaStream();
                        mediaStream.getVideoTracks().forEach(t=>{
                            stream.addTrack(t)
                        })
                        await chimeClient!.videoInputDeviceSetting!.setVideoInput(mediaStream)
                        chimeClient!.videoInputDeviceSetting!.startLocalVideoTile()
                        await chimeClient!.videoInputDeviceSetting!.setVirtualBackgrounEnable(true)
                        await chimeClient!.videoInputDeviceSetting!.setVirtualBackgroundSegmentationType("None")
                    }else{
                        await chimeClient!.videoInputDeviceSetting!.setVideoInput(null)
                        chimeClient!.videoInputDeviceSetting!.stopLocalVideoTile()

                    }
                }
                videoElem.src=path            
                videoElem.currentTime=0
                videoElem.autoplay=true
                videoElem.play()

            }else{
                console.log("not supported filetype", fileType)
            }            
        }
        input.click()
    }    

    const onVirtualBGChange = async (e: any) => {
        if (e.target.value === "None") {
            chimeClient!.videoInputDeviceSetting!.setVirtualBackgrounEnable(false)
            chimeClient!.videoInputDeviceSetting!.setVirtualBackgroundSegmentationType("None")
            setGuiCounter(guiCounter+1)
        } else {
            chimeClient!.videoInputDeviceSetting!.setVirtualBackgrounEnable(true)
            chimeClient!.videoInputDeviceSetting!.setVirtualBackgroundSegmentationType(e.target.value)
            setGuiCounter(guiCounter+1)
        }
    }

    const setBackgroundImage = () =>{
        const input = document.createElement("input")
        input.type = "file"
        input.onchange = (e: any) => {
            const path = URL.createObjectURL(e.target.files[0]);
            const fileType = e.target.files[0].type
            console.log(path, fileType)

            if(fileType.startsWith("image")){
                chimeClient!.videoInputDeviceSetting!.setBackgroundImagePath(path)
            }else{
                console.log("not supported filetype", fileType)
            }            
        }
        input.click()
    }    

    const onInputAudioChange = async (e: any) => {
        //// for input movie experiment [start]
        const videoElem = document.getElementById("for-input-movie")! as HTMLVideoElement
        videoElem.pause()
        videoElem.srcObject=null
        videoElem.src=""
        //// for input movie experiment [end]

        if (e.target.value === "None") {
            await chimeClient!.audioInputDeviceSetting!.setAudioInput(null)
            setGuiCounter(guiCounter+1)
        } else {
            await chimeClient!.audioInputDeviceSetting!.setAudioInput(e.target.value)
            setGuiCounter(guiCounter+1)
        }
    }
    const onSuppressionChange = async (e:any) =>{
        if (e.target.value === "None") {
            await chimeClient!.audioInputDeviceSetting!.setAudioSuppressionEnable(false)
            setGuiCounter(guiCounter+1)
        } else {
            await chimeClient!.audioInputDeviceSetting!.setAudioSuppressionEnable(true)
            await chimeClient!.audioInputDeviceSetting!.setVoiceFocusSpec({variant:e.target.value})
            setGuiCounter(guiCounter+1)
        }
    }

    const onOutputAudioChange = async (e: any) => {
        if (e.target.value === "None") {
            await chimeClient!.audioOutputDeviceSetting!.setAudioOutput(null)
            setGuiCounter(guiCounter+1)
        } else {
            await chimeClient!.audioOutputDeviceSetting!.setAudioOutput(e.target.value)
            setGuiCounter(guiCounter+1)
        }
    }    

    

    return(
        <div>
            <Dialog disableBackdropClick disableEscapeKeyDown scroll="paper" open={props.open} onClose={props.onClose} >
                <DialogTitle>
                    <Typography gutterBottom>
                        Settings
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="h5" gutterBottom>
                        Devices and Effects
                    </Typography>
                    <form className={classes.form} noValidate>
                        <FormControl className={classes.formControl} >
                            <InputLabel>Camera</InputLabel>
                            <Select onChange={onInputVideoChange} value={chimeClient!.videoInputDeviceSetting!.videoInput}>
                                <MenuItem disabled value="Video">
                                    <em>Video</em>
                                </MenuItem>
                                {videoInputList?.map(dev => {
                                    return <MenuItem value={dev.deviceId} key={dev.deviceId}>{dev.label}</MenuItem>
                                })}
                            </Select>
                        </FormControl>
                        <div style={{display:"flex"}}>
                            <FormControl className={classes.formControl} >
                                <InputLabel>Virtual Background</InputLabel>
                                <Select onChange={onVirtualBGChange} value={chimeClient!.videoInputDeviceSetting!.virtualBackgroundSegmentationType} >
                                    <MenuItem disabled value="Video">
                                        <em>VirtualBG</em>
                                    </MenuItem>
                                    <MenuItem value="None">
                                        <em>None</em>
                                    </MenuItem>
                                    <MenuItem value="BodyPix">
                                        <em>BodyPix</em>
                                    </MenuItem>
                                    <MenuItem value="GoogleMeet">
                                        <em>GoogleMeet</em>
                                    </MenuItem>
                                    <MenuItem value="GoogleMeetTFLite">
                                        <em>GoogleMeetTFLite</em>
                                    </MenuItem>
                                </Select>
                            </FormControl>

                            {/* <Button variant="outlined" color="primary" onClick={()=>{bgFileInputRef.current!.click()}} size="small" > */}
                            <Button variant="outlined" color="primary" onClick={setBackgroundImage} size="small" >
                                <Typography  variant="caption">
                                    background image
                                </Typography>
                            </Button>
                        </div>

                        <FormControl className={classes.formControl} >
                            <InputLabel>Microhpone</InputLabel>
                            <Select onChange={onInputAudioChange} value={chimeClient!.audioInputDeviceSetting!.audioInput} >
                                <MenuItem disabled value="Video">
                                    <em>Microphone</em>
                                </MenuItem>
                                {audioInputList?.map(dev => {
                                    return <MenuItem value={dev.deviceId} key={dev.deviceId}>{dev.label}</MenuItem>
                                })}
                            </Select>
                        </FormControl>

                        <FormControl className={classes.formControl} >
                            <InputLabel>Noise Suppression</InputLabel>
                            <Select onChange={onSuppressionChange} value={chimeClient!.audioInputDeviceSetting!.audioSuppressionEnable ? chimeClient!.audioInputDeviceSetting!.voiceFocusSpec?.variant: "None" } >
                                <MenuItem disabled value="Video">
                                    <em>Microphone</em>
                                </MenuItem>
                                {["None", "auto", "c100", "c50", "c20", "c10"].map(val => {
                                    return <MenuItem value={val} key={val}>{val}</MenuItem>
                                })}
                            </Select>
                        </FormControl>


                        <FormControl className={classes.formControl} >
                            <InputLabel>Speaker</InputLabel>
                            <Select onChange={onOutputAudioChange} value={chimeClient!.audioOutputDeviceSetting!.audioOutput} >
                                <MenuItem disabled value="Video">
                                    <em>Speaker</em>
                                </MenuItem>
                                {audioOutputList?.map(dev => {
                                    return <MenuItem value={dev.deviceId} key={dev.deviceId} >{dev.label}</MenuItem>
                                })}
                            </Select>
                        </FormControl>


                        <div className={classes.lineSpacer} />
                        <div className={classes.lineSpacer} />
                        <Divider  />
                        <Typography variant="h5">
                            Experimentals
                        </Typography>
                        <div style={{display:"flex"}}>
                            <div style={{width:"50%"}}>
                                <Typography variant="body1" >
                                    Movie Input
                                </Typography>
                                <Typography variant="body2" >
                                    Input movie instead of the camera. 
                                    When you use this featurem, camera device and microhpone device, virtual background are not choosen.
                                </Typography>
                            </div>
                            <div style={{width:"50%"}}>
                                <Button variant="outlined" color="primary" onClick={()=>{
                                    setInputMovieFile(false)
                                        // inputMovieFileInputRef.current!.click()
                                        // exp_setNoise(false)
                                    }}>
                                    choose movie file
                                </Button>                            
                                <Button variant="outlined" color="primary" onClick={()=>{
                                    setInputMovieFile(false)
                                        // inputMovieFileInputRef.current!.click()
                                        // exp_setNoise(true)
                                    }}>
                                    choose movie file (add noise)
                                </Button>
                            </div>

                        </div>

                    </form>                    
                </DialogContent>
                <DialogActions>
                    <Button onClick={props.onClose} color="primary">
                        Ok
                    </Button>
                </DialogActions>
            </Dialog> 
            <video id="for-input-movie"  loop hidden />
        </div>


    )
}
