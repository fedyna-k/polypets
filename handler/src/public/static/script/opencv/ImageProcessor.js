class ImageProcessor {

    constructor(opencvObject) {

        if (opencvObject == undefined) {
            return;
        }

        this.cv = opencvObject;

        this.params = new this.cv.aruco_DetectorParameters();
        this.dictionary = this.cv.getPredefinedDictionary(this.cv.DICT_4X4_100);
        this.refinedParam = new this.cv.aruco_RefineParameters(10, 3, true)
        this.detector = new this.cv.aruco_ArucoDetector(dictionary, params, refinedParam);
    }

    setCV(opencvObject) {
        this.cv = opencvObject;

        this.params = new this.cv.aruco_DetectorParameters();
        this.dictionary = this.cv.getPredefinedDictionary(this.cv.DICT_4X4_100);
        this.refinedParam = new this.cv.aruco_RefineParameters(10, 3, true);
        this.detector = new this.cv.aruco_ArucoDetector(this.dictionary, this.params, this.refinedParam);
    }

    analyseImage(image) {
        let corners = [];
        let ids = [];
        let rejected = [];
        this.detector.detectMarkers(image, this.dictionary, corners, ids, rejected);

        return [corners, ids];
    }
}