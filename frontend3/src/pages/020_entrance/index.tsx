import { Avatar, Box, Button, CircularProgress, Container, CssBaseline, Grid, Link, makeStyles, TextField, Typography } from "@material-ui/core";
import React, { useState } from "react";
import { Copyright } from "../000_common/Copyright";
import { MeetingRoom } from '@material-ui/icons';
import { useAppState } from "../../providers/AppStateProvider";

const useStyles = makeStyles((theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.primary.main,
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}));

export const Entrance  = () => {
    const classes = useStyles();
    const { userId, meetingName:curMeetingName, userName:curUserName, joinMeeting, handleSignOut, setMessage, setStage } = useAppState()
    const [ meetingName, setMeetingName] = useState(curMeetingName || "")
    const [ userName, setUserName] = useState(curUserName || "")
    const [isLoading, setIsLoading] = useState(false)


    const onJoinMeetingClicked = () => {
        setIsLoading(true)
        joinMeeting(meetingName || "", userName || "").then(()=>{
            console.log("joined to meeting..")
            setIsLoading(false)
            setStage("WAITING_ROOM")
        }).catch(e=>{
            console.log(e)
            setMessage("Exception", "Enter Room Failed", [`${e.message}`, `(code: ${e.code})`] )     
            setIsLoading(false)
        })
    }

    return (
        <Container maxWidth="xs" >
            <CssBaseline />
            <div className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <MeetingRoom />
                </Avatar>

                <Typography variant="h4">
                    Join Meeting
                </Typography>
                <form className={classes.form} noValidate>
                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="MeetingName"
                        name="MeetingName"
                        label="MeetingName"
                        autoFocus
                        value={meetingName}
                        onChange={(e) => setMeetingName(e.target.value)}
                    />

                    <TextField
                        variant="outlined"
                        margin="normal"
                        required
                        fullWidth
                        id="UserName"
                        name="UserName"
                        label="UserName"
                        // value={localUserId}
                        onChange={(e) => setUserName(e.target.value)}
                    />
                    <Grid container direction="column" alignItems="center" >
                    {
                        isLoading ?
                            <CircularProgress />
                            :
                            <Button
                                fullWidth
                                variant="contained"
                                color="primary"
                                className={classes.submit}
                                onClick={onJoinMeetingClicked}
                                id="submit"
                            >
                                Join Meeting
                        </Button>
                    }
                    </Grid>
                    <Grid container direction="column" >
                        <Grid item xs>
                            <Link onClick={(e: any) => { setStage("CREATE_MEETING_ROOM") }}>
                                    Create Room
                            </Link>
                        </Grid>
                        <Grid item xs>
                            <Link onClick={(e: any) => { handleSignOut(userId!); setStage("SIGNIN") }}>
                                Sign out
                            </Link>
                        </Grid>
                    </Grid>
                    <Box mt={8}>
                        <Copyright />
                    </Box>
                </form>
            </div>
        </Container>
    )
}
