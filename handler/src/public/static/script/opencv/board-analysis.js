imgProc = new ImageProcessor();

function onCvReady(){
    cv.then((cv) => {
        // const params = new cv.aruco_DetectorParameters();
        // const dictionary = cv.getPredefinedDictionary(cv.DICT_4X4_100);
        // const refinedParam = new cv.aruco_RefineParameters(10, 3, true)
        // const detector = new cv.aruco_ArucoDetector(dictionary, params, refinedParam);
        
        imgProc.setCV(cv);
    });
}