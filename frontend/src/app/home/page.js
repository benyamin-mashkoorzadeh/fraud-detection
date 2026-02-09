'use client'

import React, {useState, useEffect, useMemo} from "react"
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemText,
    LinearProgress,
    Box,
    Paper,
    Switch,
    CssBaseline,
    Input,
    Snackbar,
    Alert
} from "@mui/material"
import {createTheme, ThemeProvider} from "@mui/material/styles"
import TableCM from "@/components/TableCM"
import TableScore from "@/components/TableScore"

const drawerWidth = 240

const ProgressBar = () => {
    const [darkMode, setDarkMode] = useState(false)
    const [progress, setProgress] = useState(0)
    const [isProcessing, setIsProcessing] = useState(false)
    const [message, setMessage] = useState("")
    const [scoreData, setScoreData] = useState([])
    const [cmData, setCmData] = useState([])
    const [showData, setShowData] = useState(false)
    const [showProgress, setShowProgress] = useState(false)
    const [fileName, setFileName] = useState("")
    const [file, setFile] = useState(null)
    const [snackbarMessage, setSnackbarMessage] = useState("")
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarSeverity, setSnackbarSeverity] = useState("info")

    // Initialize dark mode from localStorage
    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode") === "true"
        setDarkMode(savedDarkMode)
    }, []);

    // Save dark mode preference to localStorage
    useEffect(() => {
        localStorage.setItem("darkMode", darkMode)
    }, [darkMode])

    // Memoize the theme to prevent unnecessary recalculations
    const theme = useMemo(
        () =>
            createTheme({
                palette: {
                    mode: darkMode ? "dark" : "light",
                    background: {
                        default: darkMode ? '#212121' : '#ffffff',
                        paper: darkMode ? '#424242' : '#ffffff',
                    },
                },
            }),
        [darkMode]
    )

    // Chunking the file and send it
    const uploadFileAndStartProcessing = async () => {
        const chunkSize = 1 * 1024 * 1024 // 1MB
        const totalChunks = Math.ceil(file.size / chunkSize)
        let uploadedChunks = 0

        setShowProgress(true)
        setIsProcessing(true)
        setMessage("Uploading file...")
        setSnackbarMessage("File is uploading...")
        setSnackbarSeverity("info")
        setSnackbarOpen(true) // Showing the notification of upload

        for (let chunkNumber = 0; chunkNumber < totalChunks; chunkNumber++) {
            const start = chunkNumber * chunkSize
            const end = Math.min(start + chunkSize, file.size)
            const chunk = file.slice(start, end)

            const formData = new FormData()
            formData.append("file", chunk)
            formData.append("chunkNumber", chunkNumber)
            formData.append("fileName", file.name)

            try {
                await fetch("http://localhost:8000/api/upload-chunk", {
                    method: "POST",
                    body: formData,
                })
                uploadedChunks++
                setProgress(Math.round((uploadedChunks / totalChunks) * 100)) // Updating the progress of upload
            } catch (error) {
                setSnackbarMessage("Error uploading file chunk")
                setSnackbarSeverity("error")
                setSnackbarOpen(true)
                break
            }
        }

        // بعد از آپلود همه چانک‌ها، درخواست ترکیب آن‌ها
        const mergeData = new FormData()
        mergeData.append("fileName", file.name)
        mergeData.append("totalChunks", totalChunks)

        const mergeResponse = await fetch("http://localhost:8000/api/merge-chunks", {
            method: "POST",
            body: mergeData,
        })

        if (mergeResponse.ok) {
            await fetch("http://localhost:8000/api/run-python", {method: "POST"})
            setSnackbarMessage("File processing started...")
            setSnackbarSeverity("info")
            setSnackbarOpen(true) // Showing the notification of start of process
            checkProgress(file.name) // Checking the status of process
        } else {
            setSnackbarMessage("Failed to merge chunks.")
            setSnackbarSeverity("error")
            setSnackbarOpen(true)
        }
    }

    const checkProgress = () => {
        const interval = setInterval(() => {
            fetch("http://localhost:8000/api/progress")
                .then((response) => response.json())
                .then((data) => {
                    setProgress(data.progress || 0)
                    setMessage(data.message || "Processing...")
                    if (data.progress === 100) {
                        clearInterval(interval)
                        setIsProcessing(false)
                        setMessage("Execution completed successfully")
                        setSnackbarMessage("File processing completed!")
                        setSnackbarSeverity("success")
                        setSnackbarOpen(true) // Notification for completing the process
                        fetchData()
                        setShowProgress(false)
                    }
                })
        }, 2000)
    }

    const fetchData = () => {
        fetch("http://localhost:8000/api/show-data")
            .then((response) => response.json())
            .then((data) => {
                if (data && Array.isArray(data.scoreData) && Array.isArray(data.cmData)) {
                    setScoreData(data.scoreData)
                    setCmData(data.cmData)
                }
            })
    }

    const handleFileChange = (event) => {
        const file = event.target.files[0]
        if (file) {
            setFileName(file.name) // Update the file name when a file is selected
            setFile(file) // Store the file object
        }
    }

    const handleSnackbarClose = () => {
        setSnackbarOpen(false)
    }

    const handleDrawerClick = (action) => {
        switch (action) {
            case "upload":
                if (fileName) {
                    setSnackbarMessage(fileName)
                    setSnackbarSeverity("info")
                    setSnackbarOpen(true)
                } else {
                    setSnackbarMessage("No file selected.")
                    setSnackbarSeverity("warning")
                    setSnackbarOpen(true)
                }
                break
            case "status":
                setSnackbarMessage(`Processing... ${progress}%`)
                setSnackbarSeverity("info")
                setSnackbarOpen(true)
                break
            default:
                break
        }
    }

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline sx={{backgroundColor: darkMode ? '#212121' : '#00df82'}}/>
            <Box>
                <Drawer
                    variant="permanent"
                    sx={{
                        width: drawerWidth,
                        flexShrink: 0,
                        backgroundColor: darkMode ? '#212121' : '#00df82',
                        [`& .MuiDrawer-paper`]: {
                            width: drawerWidth,
                            boxSizing: 'border-box',
                            backgroundColor: darkMode ? '#212121' : '#00df82'
                        }
                    }}
                >
                    <Toolbar/>
                    <List>
                        <ListItem button onClick={() => handleDrawerClick("upload")} sx={{
                            border: '1px solid transparent',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: '#03624c',
                                color: '#fff',
                                border: '1px solid #028a3c',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            },
                            transition: 'all 0.3s ease',
                        }}>
                            <ListItemText primary="Upload File"/>
                        </ListItem>
                        <ListItem button onClick={() => handleDrawerClick("status")} sx={{
                            border: '1px solid transparent',
                            borderRadius: '4px',
                            '&:hover': {
                                backgroundColor: '#03624c',
                                color: '#fff',
                                border: '1px solid #028a3c',
                                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                            },
                            transition: 'all 0.3s ease',
                        }}>
                            <ListItemText primary="Processing Status"/>
                        </ListItem>
                    </List>
                </Drawer>

                <Box component="main" sx={{flexGrow: 1, p: 3, ml: `${drawerWidth}px`}}>
                    <AppBar position="fixed" sx={{
                        width: `calc(100% - ${drawerWidth}px)`,
                        ml: `${drawerWidth}px`,
                        backgroundColor: darkMode ? '#2c3e50' : '#03624c'
                    }}>
                        <Toolbar>
                            <Typography variant="h6" sx={{flexGrow: 1}}>Fraud Detection Panel</Typography>
                            <Switch
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                                inputProps={{'aria-label': 'controlled'}}
                            />
                        </Toolbar>
                    </AppBar>
                    <Toolbar/>

                    <Container>
                        {/* Browse Button for File Upload */}
                        <Box sx={{display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap"}}>
                            <Button
                                variant="contained"
                                component="label"
                                sx={{
                                    mr: "1rem",
                                    textTransform: "none",
                                    fontWeight: "bold",
                                    backgroundColor: "#03624c",
                                    border: '2px solid #03624c',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease',
                                    "&:hover": {
                                        backgroundColor: "#028a3c",
                                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                                        border: '2px solid #028a3c',
                                    },
                                }}
                            >
                                Browse
                                <Input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                />
                            </Button>

                            {fileName && (
                                <Typography variant="body1" sx={{mt: 2}}>
                                    Selected File: {fileName}
                                </Typography>
                            )}
                        </Box>

                        <Button
                            variant="contained"
                            sx={{backgroundColor: "#03624c", mt: "2rem"}}
                            onClick={uploadFileAndStartProcessing}
                            disabled={isProcessing}

                        >
                            Upload & Start Processing
                        </Button>

                        {/*  Showing the progress when it is processing */}
                        {showProgress && (
                            <>
                                <Typography variant="h6"
                                            sx={{mt: 2, color: "#424242"}}>Progress: {progress}%</Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        mt: 1,
                                        backgroundColor: darkMode ? '#424242' : '#e0e0e0',
                                        '& .MuiLinearProgress-bar': {
                                            backgroundColor: darkMode ? '#424242' : '#e0e0e0',
                                        }
                                    }}
                                />
                                <Typography sx={{mt: 2, color: "#424242"}}>{message}</Typography>
                            </>
                        )}

                        {!isProcessing && progress === 100 && (
                            <Box sx={{textAlign: "center"}}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={() => setShowData(!showData)}
                                    sx={{mt: 2, backgroundColor: '#03624c', color: 'white'}}
                                >
                                    {showData ? 'Hide Data' : 'Show Data'}
                                </Button>
                            </Box>
                        )}

                        {showData && (
                            <Box sx={{p: 2, mt: 2}}>
                                <Paper sx={{p: 2, mt: 2}}>
                                    <TableCM data={cmData}/>
                                </Paper>
                                <Paper sx={{p: 2, mt: 2}}>
                                    <TableScore data={scoreData}/>
                                </Paper>
                            </Box>
                        )}
                    </Container>
                </Box>
            </Box>

            {/* Snackbar for Notifications */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
            >
                <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{width: '100%'}}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </ThemeProvider>
    )
}

export default ProgressBar
