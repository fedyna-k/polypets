class ImageProcessor {

    constructor(opencvObject) {

        if (opencvObject == undefined) {
            return;
        }

        this.cv = opencvObject;

        this.params = new this.cv.aruco_DetectorParameters();
        this.dictionary = this.cv.getPredefinedDictionary(this.cv.DICT_4X4_100);
        this.refinedParam = new this.cv.aruco_RefineParameters(10, 3, true);
        this.detector = new this.cv.aruco_ArucoDetector(this.dictionary, this.params, this.refinedParam);
    }

    setCV(opencvObject) {
        this.cv = opencvObject;

        this.params = new this.cv.aruco_DetectorParameters();
        this.dictionary = this.cv.getPredefinedDictionary(this.cv.DICT_4X4_100);
        this.refinedParam = new this.cv.aruco_RefineParameters(10, 3, true);
        this.detector = new this.cv.aruco_ArucoDetector(this.dictionary, this.params, this.refinedParam);
    }

    analyseImage(image){
        const mat = this.cv.matFromImageData(image);
        return this.analyseMat(mat);
    }

    analyseMat(mat) {
        let gray = new this.cv.Mat();
        this.cv.cvtColor(mat, gray, this.cv.COLOR_RGB2GRAY);
        mat.delete();
        
        let markers_position = new this.cv.MatVector();
        let ids = new this.cv.Mat();
        let rejected = new this.cv.MatVector();

        // Detection
        this.detector.detectMarkers(gray, markers_position, ids, rejected);
        gray.delete();
        
        // Put data in usable array
        // let result = [];
        // for (let i = 0; i < markers_position.size(); i++) {
        //     let marker = markers_position.get(i); // Get marker position
        //     let points = [];
        //     for (let j = 0; j < marker.rows; j++) {
        //         points.push([marker.data32F[j * 2], marker.data32F[j * 2 + 1]]); // Get data as int
        //     }
        //     result.push(points);
        //     console.log(`Marker ${i + 1} :`, points);
        //     marker.delete();
        // }
        
        // Free memory
        ids.delete();
        markers_position.delete();
        rejected.delete();

        return [markers_position, ids];
        // return result;
    }
}